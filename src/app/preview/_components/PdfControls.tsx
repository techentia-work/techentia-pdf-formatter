import { ChevronLeft, ChevronRight, Download, Edit2, ExternalLink, Eye, EyeOff, MousePointer, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface PDFControlsProps {
    scale: number;
    rotation: number;
    currentPage: number;
    totalPages: number;
    isEditMode: boolean;
    showFieldLabels: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotate: () => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    onToggleEdit: () => void;
    onToggleLabels: () => void;
    onDownload: () => void;
    onOpenExternal: () => void;
}

// PDF Controls Component
export default function PDFControls({ scale, rotation, currentPage, totalPages, isEditMode, showFieldLabels, onZoomIn, onZoomOut, onRotate, onPrevPage, onNextPage, onToggleEdit, onToggleLabels, onDownload, onOpenExternal }: PDFControlsProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    onClick={onZoomOut}
                    className="p-2 text-gray-600 hover:text-gray-900 border rounded transition-colors disabled:opacity-50"
                    title="Zoom Out"
                    disabled={scale <= 0.5}
                >
                    <ZoomOut size={16} />
                </button>
                <span className="text-sm text-gray-600 min-w-16 text-center font-medium">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={onZoomIn}
                    className="p-2 text-gray-600 hover:text-gray-900 border rounded transition-colors disabled:opacity-50"
                    title="Zoom In"
                    disabled={scale >= 3.0}
                >
                    <ZoomIn size={16} />
                </button>
                <button
                    onClick={onRotate}
                    className="p-2 text-gray-600 hover:text-gray-900 border rounded ml-2 transition-colors"
                    title="Rotate"
                >
                    <RotateCw size={16} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleEdit}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${isEditMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    title="Toggle Edit Mode"
                >
                    {isEditMode ? <MousePointer size={16} /> : <Edit2 size={16} />}
                    {isEditMode ? 'Edit Mode' : 'View Mode'}
                </button>
                <button
                    onClick={onToggleLabels}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm px-2 py-2 rounded transition-colors"
                    title="Toggle Field Labels"
                >
                    {showFieldLabels ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm px-2 py-2 rounded transition-colors"
                    title="Download PDF"
                >
                    <Download size={16} />
                </button>
                <button
                    onClick={onOpenExternal}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm px-2 py-2 rounded transition-colors"
                    title="Open in new tab"
                >
                    <ExternalLink size={16} />
                </button>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevPage}
                        disabled={currentPage <= 1}
                        className="flex items-center gap-1 px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={14} />
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 px-3 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={onNextPage}
                        disabled={currentPage >= totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        Next
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    )
}