import { FormFieldType } from "@/lib/types";

interface SelectionInfoProps {
    selectedFields: string[];
    selectedForm: any;
    getFieldWithUpdates: (field: FormFieldType) => FormFieldType;
    pendingUpdates: any;
    onClearSelection: () => void;
    onDeleteSelected: () => void;
}

// Selection Info Component
export default function SelectionInfo({ selectedFields, selectedForm, getFieldWithUpdates, pendingUpdates, onClearSelection, onDeleteSelected }: SelectionInfoProps) {
    if (selectedFields.length === 0) return null;

    return (
        <div className="p-3 border-t bg-blue-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-800">
                        {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                    </span>
                    {selectedFields.length === 1 && (() => {
                        const field = selectedForm?.fields.find((f: any) => f.id === selectedFields[0]);
                        const fieldWithUpdates = field ? getFieldWithUpdates(field) : null;
                        if (fieldWithUpdates?.position) {
                            return (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    Page {fieldWithUpdates.position.pdfPageNo} • {Math.round(fieldWithUpdates.position.x)},{Math.round(fieldWithUpdates.position.y)} • {Math.round(fieldWithUpdates.position.width)}×{Math.round(fieldWithUpdates.position.height)}
                                    {pendingUpdates[fieldWithUpdates.id] && ' (Modified)'}
                                </span>
                            );
                        }
                        return null;
                    })()}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onDeleteSelected}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                        Delete Selected
                    </button>
                    <button
                        onClick={onClearSelection}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                        Clear Selection
                    </button>
                </div>
            </div>
        </div>
    );
};