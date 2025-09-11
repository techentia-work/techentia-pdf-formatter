"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FileText, Loader2 } from 'lucide-react';
import { useFormStore } from '@/lib/store';
import { useForm } from '@/hooks/useForm';
import type { FormFieldType, FieldPosition } from '@/lib/types';
import { PageNavigationDropZone, FieldOverlay, FieldStatistics, PDFControls, PageThumbnails, SaveControlsBanner, SelectionInfo } from "../_components"

// Dynamically import PDF components
const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false });

// Initialize PDF.js worker
const initializePdfJs = () => {
    if (typeof window !== 'undefined') {
        import('react-pdf').then((pdfjs) => {
            pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        });
    }
};

// Types
interface DragState {
    id: string;
    field: FormFieldType;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
}

interface ResizeState {
    field: FormFieldType;
    direction: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    originalX: number;
    originalY: number;
}

// Main PDF Preview Component
export default function PDFPreviewPage() {
    // State
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showFieldLabels, setShowFieldLabels] = useState(true);
    const [pageWidth, setPageWidth] = useState(0);
    const [pageHeight, setPageHeight] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Drag and resize state
    const [draggedField, setDraggedField] = useState<DragState | null>(null);
    const [resizingField, setResizingField] = useState<ResizeState | null>(null);
    const [dragOverDropZone, setDragOverDropZone] = useState<'left' | 'right' | null>(null);

    // Refs
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    // Store hooks
    const {
        selectedForm,
        selectedFields,
        selectField,
        deselectField,
        clearFieldSelection,
        pendingUpdates,
        hasUnsavedChanges,
        updateFieldLocally,
        getFieldWithUpdates,
        clearPendingUpdates,
        getPendingUpdatesForSave,
        hasFieldPendingUpdates,
        toggleFieldSelection
    } = useFormStore();

    // Form API hooks
    const { batchUpdateFields } = useForm();

    // Initialize client-side
    useEffect(() => {
        setIsClient(true);
        initializePdfJs();
    }, []);

    // PDF Control handlers
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    const handleDownloadPdf = () => {
        if (selectedForm?.pdfUrl) {
            const link = document.createElement('a');
            link.href = selectedForm.pdfUrl;
            link.download = `${selectedForm.name}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleOpenExternal = () => {
        if (selectedForm?.pdfUrl) {
            window.open(selectedForm.pdfUrl, '_blank');
        }
    };

    // PDF event handlers
    const onDocumentLoadSuccess = (pdf: any) => {
        setTotalPages(pdf.numPages);
        setPdfError(null);
    };

    const onDocumentLoadError = (error: Error) => {
        setPdfError(error.message);
    };

    const onPageLoadSuccess = (page: any) => {
        setPageWidth(page.width);
        setPageHeight(page.height);
    };

    // Save handlers
    const handleSaveChanges = async () => {
        if (!selectedForm || !hasUnsavedChanges) return;

        setIsSaving(true);
        try {
            const updates = getPendingUpdatesForSave();
            await batchUpdateFields({
                formId: selectedForm.id,
                fieldUpdates: updates
            });
            clearPendingUpdates();
        } catch (error) {
            console.error('Failed to save changes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        clearPendingUpdates();
    };

    const handleFieldClick = (e: React.MouseEvent, field: FormFieldType) => {
        if (!isEditMode) return;

        e.stopPropagation();
        if (!selectedFields.includes(field.id)) {
            if (!e.ctrlKey && !e.metaKey) {
                clearFieldSelection();
            }
            selectField(field.id);
        }
    };

    const handleFieldMouseDown = (e: React.MouseEvent, field: FormFieldType) => {
        if (!isEditMode) return;

        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = pdfContainerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        setDraggedField({
            id: field.id,
            field,
            startX: field.position?.x || 0,
            startY: field.position?.y || 0,
            offsetX,
            offsetY
        });

        if (!selectedFields.includes(field.id)) {
            if (!e.ctrlKey && !e.metaKey) {
                clearFieldSelection();
            }
            selectField(field.id);
        }
    };

    useEffect(() => {
        clearFieldSelection();
    }, [currentPage, clearFieldSelection]);

    const handleDropZoneEnter = (zone: 'left' | 'right') => {
        if (draggedField && isEditMode) {
            setDragOverDropZone(zone);
        }
    };

    const handleDropZoneLeave = () => {
        setDragOverDropZone(null);
    };

    const handleDropZoneDrop = (zone: 'left' | 'right') => {
        if (!draggedField || !selectedForm) return;

        const newPage = zone === 'left' ? currentPage - 1 : currentPage + 1;

        if (newPage >= 1 && newPage <= totalPages) {
            const updatedPosition: FieldPosition = {
                ...draggedField.field.position!,
                pdfPageNo: newPage,
                x: zone === 'left' ? pageWidth - 150 : 50,
                y: 100
            };

            updateFieldLocally(draggedField.id, { position: updatedPosition });
            setCurrentPage(newPage);
        }

        setDragOverDropZone(null);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (draggedField && pdfContainerRef.current) {
            const containerRect = pdfContainerRef.current.getBoundingClientRect();

            const mouseX = e.clientX - containerRect.left;
            const containerWidth = containerRect.width;

            if (mouseX < 60 && currentPage > 1) {
                setDragOverDropZone('left');
            } else if (mouseX > containerWidth - 60 && currentPage < totalPages) {
                setDragOverDropZone('right');
            } else {
                setDragOverDropZone(null);
            }

            const newX = (e.clientX - containerRect.left - draggedField.offsetX) / scale;
            const newY = (e.clientY - containerRect.top - draggedField.offsetY) / scale;

            const maxX = pageWidth - (draggedField.field.position?.width || 100);
            const maxY = pageHeight - (draggedField.field.position?.height || 30);

            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, Math.min(newY, maxY));

            const updatedPosition: FieldPosition = {
                ...draggedField.field.position!,
                x: constrainedX,
                y: constrainedY
            };

            updateFieldLocally(draggedField.id, { position: updatedPosition });
        }

        if (resizingField && pdfContainerRef.current) {
            const containerRect = pdfContainerRef.current.getBoundingClientRect();
            const deltaX = (e.clientX - resizingField.startX) / scale;
            const deltaY = (e.clientY - resizingField.startY) / scale;

            const currentField = getFieldWithUpdates(resizingField.field);
            const currentPos = currentField.position!;

            let newWidth = resizingField.startWidth;
            let newHeight = resizingField.startHeight;
            let newX = resizingField.originalX;
            let newY = resizingField.originalY;

            // Handle resizing based on direction
            if (resizingField.direction.includes('right')) {
                newWidth = Math.max(50, resizingField.startWidth + deltaX);
            }
            if (resizingField.direction.includes('left')) {
                newWidth = Math.max(50, resizingField.startWidth - deltaX);
                newX = resizingField.originalX + (resizingField.startWidth - newWidth);
            }
            if (resizingField.direction.includes('bottom')) {
                newHeight = Math.max(20, resizingField.startHeight + deltaY);
            }
            if (resizingField.direction.includes('top')) {
                newHeight = Math.max(20, resizingField.startHeight - deltaY);
                newY = resizingField.originalY + (resizingField.startHeight - newHeight);
            }

            // Constrain to page bounds
            newX = Math.max(0, Math.min(newX, pageWidth - newWidth));
            newY = Math.max(0, Math.min(newY, pageHeight - newHeight));

            const updatedPosition: FieldPosition = {
                ...currentPos,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            };

            updateFieldLocally(resizingField.field.id, { position: updatedPosition });
        }
    }, [draggedField, resizingField, scale, pageWidth, pageHeight, updateFieldLocally, getFieldWithUpdates, currentPage, totalPages]);

    const getCurrentPageFields = useCallback((): FormFieldType[] => {
        if (!selectedForm?.fields) return [];

        return selectedForm.fields
            .map((field: FormFieldType) => getFieldWithUpdates(field))
            .filter((field: FormFieldType) => field.position?.pdfPageNo === currentPage);
    }, [selectedForm?.fields, getFieldWithUpdates, currentPage]);

    const handleMouseUp = useCallback(() => {
        if (draggedField && dragOverDropZone) {
            const newPage = dragOverDropZone === 'left' ? currentPage - 1 : currentPage + 1;

            if (newPage >= 1 && newPage <= totalPages) {
                const currentField = getFieldWithUpdates(draggedField.field);
                const updatedPosition: FieldPosition = {
                    ...currentField.position!,
                    pdfPageNo: newPage,
                    x: Math.max(0, (pageWidth / 2) - (currentField.position!.width / 2)),
                    y: 100
                };

                updateFieldLocally(draggedField.id, { position: updatedPosition });
                setCurrentPage(newPage);
            }
        }

        setDraggedField(null);
        setResizingField(null);
        setDragOverDropZone(null);
    }, [draggedField, dragOverDropZone, currentPage, totalPages, pageWidth, updateFieldLocally, getFieldWithUpdates]);

    const handleFieldResize = (field: FormFieldType, direction: string, e: React.MouseEvent) => {
        if (!isEditMode) return;

        e.preventDefault();
        e.stopPropagation();

        const currentField = getFieldWithUpdates(field);
        const pos = currentField.position!;

        setResizingField({
            field: currentField,
            direction,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: pos.width,
            startHeight: pos.height,
            originalX: pos.x,
            originalY: pos.y
        });
    };

    const handleDeleteSelected = () => {
        if (selectedForm && selectedFields.length > 0) {
            const confirmed = window.confirm(
                `Are you sure you want to delete ${selectedFields.length} field${selectedFields.length !== 1 ? 's' : ''}?`
            );
            if (confirmed) {
                console.log('Delete multiple fields:', selectedFields);
                clearFieldSelection();
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
        setCurrentPage(newPage);
        clearFieldSelection();
    };

    useEffect(() => {
        if (draggedField || resizingField) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedField, resizingField, handleMouseMove, handleMouseUp]);

    if (!selectedForm) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Form Selected</h3>
                    <p className="text-gray-500">Select a form to preview its PDF and manage field positions</p>
                </div>
            </div>
        );
    }

    if (!isClient) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Loading PDF viewer...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <SaveControlsBanner
                hasUnsavedChanges={hasUnsavedChanges}
                pendingCount={Object.keys(pendingUpdates).length}
                isSaving={isSaving}
                onSave={handleSaveChanges}
                onDiscard={handleDiscardChanges}
            />
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">PDF Field Editor</h3>
                            <p className="text-sm text-gray-500">{selectedForm.name}</p>
                            {draggedField && totalPages > 1 && (
                                <p className="text-xs text-blue-600 mt-1 font-medium">
                                    💡 Drag to the blue arrows on sides to move field to other pages
                                </p>
                            )}
                        </div>
                    </div>
                    <PDFControls
                        scale={scale}
                        rotation={rotation}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        isEditMode={isEditMode}
                        showFieldLabels={showFieldLabels}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onRotate={handleRotate}
                        onPrevPage={handlePrevPage}
                        onNextPage={handleNextPage}
                        onToggleEdit={() => {
                            setIsEditMode(!isEditMode);
                            if (!isEditMode) clearFieldSelection();
                        }}
                        onToggleLabels={() => setShowFieldLabels(!showFieldLabels)}
                        onDownload={handleDownloadPdf}
                        onOpenExternal={handleOpenExternal}
                    />
                </div>
                <div className="relative bg-gray-100">
                    {pdfError ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-red-600 mb-2 font-medium">Failed to load PDF</p>
                                <p className="text-sm text-gray-500 mb-3">{pdfError}</p>
                                <button
                                    onClick={() => setPdfError(null)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 overflow-auto">
                            <div
                                ref={pdfContainerRef}
                                className={`relative mx-auto ${draggedField ? 'cursor-grabbing' : ''}`}
                                style={{
                                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                                    transformOrigin: 'center top',
                                    transition: draggedField || resizingField ? 'none' : 'transform 0.2s ease',
                                }}
                                onClick={() => {
                                    if (isEditMode && selectedFields.length > 0) {
                                        clearFieldSelection();
                                    }
                                }}
                            >
                                <PageNavigationDropZone
                                    side="left"
                                    active={draggedField !== null && currentPage > 1}
                                    isHighlighted={dragOverDropZone === 'left'}
                                    targetPage={currentPage - 1}
                                    
                                />
                                <PageNavigationDropZone
                                    side="right"
                                    active={draggedField !== null && currentPage < totalPages}
                                    isHighlighted={dragOverDropZone === 'right'}
                                    targetPage={currentPage + 1}
                                    
                                />
                                <Document
                                    file={selectedForm.pdfUrl}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    onLoadError={onDocumentLoadError}
                                    loading={
                                        <div className="flex items-center justify-center h-96">
                                            <div className="text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                                                <p className="text-sm text-gray-600">Loading PDF...</p>
                                            </div>
                                        </div>
                                    }
                                    error={
                                        <div className="flex items-center justify-center h-96">
                                            <div className="text-center">
                                                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                                <p className="text-red-600 mb-2 font-medium">Failed to load PDF</p>
                                                <p className="text-sm text-gray-500">Check if the PDF URL is valid and accessible</p>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="relative">
                                        <Page
                                            pageNumber={currentPage}
                                            onLoadSuccess={onPageLoadSuccess}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="shadow-lg"
                                        />
                                        {getCurrentPageFields().map(field => (
                                            <FieldOverlay
                                                key={field.id}
                                                field={field}
                                                isSelected={selectedFields.includes(field.id)}
                                                isDragging={draggedField?.id === field.id}
                                                isResizing={resizingField?.field.id === field.id}
                                                hasChanges={hasFieldPendingUpdates(field.id)}
                                                showLabels={showFieldLabels}
                                                scale={scale}
                                                isEditMode={isEditMode}
                                                onMouseDown={handleFieldMouseDown}
                                                onResize={handleFieldResize}
                                                onClick={handleFieldClick}
                                            />
                                        ))}
                                    </div>
                                </Document>
                            </div>
                        </div>
                    )}
                    {totalPages > 1 && (
                        <PageThumbnails
                            totalPages={totalPages}
                            currentPage={currentPage}
                            fields={selectedForm.fields || []}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
                <FieldStatistics
                    form={selectedForm}
                    totalPages={totalPages}
                    pendingUpdates={pendingUpdates}
                />
                <SelectionInfo
                    selectedFields={selectedFields}
                    selectedForm={selectedForm}
                    getFieldWithUpdates={getFieldWithUpdates}
                    pendingUpdates={pendingUpdates}
                    onClearSelection={clearFieldSelection}
                    onDeleteSelected={handleDeleteSelected}
                />
            </div>
        </div>
    );
}