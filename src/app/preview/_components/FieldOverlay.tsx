import { FormFieldType } from "@/lib/types";

interface FieldOverlayProps {
    field: FormFieldType;
    isSelected: boolean;
    isDragging: boolean;
    isResizing: boolean;
    hasChanges: boolean;
    showLabels: boolean;
    scale: number;
    isEditMode: boolean;
    onMouseDown: (e: React.MouseEvent, field: FormFieldType) => void;
    onResize: (field: FormFieldType, direction: string, e: React.MouseEvent) => void;
    onClick: (e: React.MouseEvent, field: FormFieldType) => void;
}

export default function FieldOverlay({ field, isSelected, isDragging, isResizing, hasChanges, showLabels, scale, isEditMode, onMouseDown, onResize, onClick }: FieldOverlayProps) {
    if (!field.position) return null;

    const fieldStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${field.position.x * scale}px`,
        top: `${field.position.y * scale}px`,
        width: `${field.position.width * scale}px`,
        height: `${field.position.height * scale}px`,
        border: hasChanges
            ? '2px solid #F59E0B'
            : isSelected
                ? '2px solid #3B82F6'
                : '2px solid rgba(59, 130, 246, 0.5)',
        backgroundColor: hasChanges
            ? 'rgba(245, 158, 11, 0.1)'
            : isSelected
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(59, 130, 246, 0.05)',
        cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
        transform: isDragging ? 'rotate(1deg) scale(1.02)' : 'none',
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
        boxShadow: isDragging
            ? '0 8px 16px rgba(0,0,0,0.2)'
            : isSelected
                ? '0 2px 8px rgba(59, 130, 246, 0.2)'
                : 'none',
        fontSize: field.position.fontSize ? `${field.position.fontSize * scale}px` : `${12 * scale}px`,
        rotate: field.position.rotate ? `${field.position.rotate}deg` : '0deg',
    };

    function ResizeHandle({ direction, className, cursor }: { direction: string; className: string; cursor: string }) {
        return (
            <div
                className={`absolute w-3 h-3 ${hasChanges ? 'bg-amber-600 border-amber-200' : 'bg-blue-600 border-white'} border rounded-full hover:bg-blue-700 transition-colors ${className}`}
                style={{ cursor }}
                onMouseDown={(e) => onResize(field, direction, e)}
                title={`Resize ${direction}`}
            />
        )
    }

    return (
        <div
            style={fieldStyle}
            onMouseDown={(e) => onMouseDown(e, field)}
            onClick={(e) => onClick(e, field)}
            className="group"
            title={`${field.label} (${field.type})${hasChanges ? ' - Modified' : ''}`}
        >
            {/* Field Label */}
            {showLabels && (
                <div className={`absolute -top-6 left-0 ${hasChanges ? 'bg-amber-600' : 'bg-blue-600'} text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none`}>
                    {field.label} {hasChanges && '(Modified)'}
                </div>
            )}

            {/* Field Type Indicator */}
            <div className={`absolute top-1 right-1 ${hasChanges ? 'bg-amber-600' : 'bg-blue-600'} text-white text-xs px-1 rounded z-10 pointer-events-none`}>
                {field.type}
            </div>

            {/* Modified Indicator */}
            {hasChanges && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full z-20 pointer-events-none" title="Field has unsaved changes" />
            )}

            {/* Field Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-xs ${hasChanges ? 'text-amber-800' : 'text-blue-800'} font-medium bg-white bg-opacity-75 px-1 rounded truncate`}>
                    {field.name}
                </span>
            </div>

            {/* Resize Handles */}
            {isEditMode && isSelected && !isDragging && (
                <>
                    <ResizeHandle direction="top-left" className="-top-1.5 -left-1.5" cursor="nw-resize" />
                    <ResizeHandle direction="top-right" className="-top-1.5 -right-1.5" cursor="ne-resize" />
                    <ResizeHandle direction="bottom-left" className="-bottom-1.5 -left-1.5" cursor="sw-resize" />
                    <ResizeHandle direction="bottom-right" className="-bottom-1.5 -right-1.5" cursor="se-resize" />

                    <div
                        className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 ${hasChanges ? 'bg-amber-600 border-amber-200' : 'bg-blue-600 border-white'} border rounded cursor-n-resize hover:bg-blue-700 transition-colors`}
                        onMouseDown={(e) => onResize(field, 'top', e)}
                        title="Resize top"
                    />
                    <div
                        className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 ${hasChanges ? 'bg-amber-600 border-amber-200' : 'bg-blue-600 border-white'} border rounded cursor-s-resize hover:bg-blue-700 transition-colors`}
                        onMouseDown={(e) => onResize(field, 'bottom', e)}
                        title="Resize bottom"
                    />
                    <div
                        className={`absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-3 ${hasChanges ? 'bg-amber-600 border-amber-200' : 'bg-blue-600 border-white'} border rounded cursor-w-resize hover:bg-blue-700 transition-colors`}
                        onMouseDown={(e) => onResize(field, 'left', e)}
                        title="Resize left"
                    />
                    <div
                        className={`absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-3 ${hasChanges ? 'bg-amber-600 border-amber-200' : 'bg-blue-600 border-white'} border rounded cursor-e-resize hover:bg-blue-700 transition-colors`}
                        onMouseDown={(e) => onResize(field, 'right', e)}
                        title="Resize right"
                    />
                </>
            )}
        </div>
    );
};