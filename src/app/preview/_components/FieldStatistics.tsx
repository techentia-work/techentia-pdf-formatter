import { AlertCircle } from "lucide-react";

interface FieldStatisticsProps {
    form: any;
    totalPages: number;
    pendingUpdates: any;
}

// Field Statistics Component
export default function FieldStatistics({ form, totalPages, pendingUpdates }: FieldStatisticsProps) {
    if (!form?.fields || form.fields.length === 0) return null;

    return (
        <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Field Distribution</h4>
                <span className="text-xs text-gray-500">
                    Total: {form.fields.length} fields
                    {Object.keys(pendingUpdates).length > 0 && (
                        <span className="ml-2 text-amber-600 font-medium">
                            • {Object.keys(pendingUpdates).length} modified
                        </span>
                    )}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                    const pageFields = form.fields.filter((f: any) => f.position?.pdfPageNo === pageNum);
                    const modifiedOnPage = pageFields.filter((f: any) => pendingUpdates[f.id]).length;
                    return (
                        <div key={pageNum} className="flex justify-between items-center p-2 bg-white rounded border text-xs">
                            <span className="font-medium text-gray-700">Page {pageNum}:</span>
                            <div className="flex gap-1">
                                <span className={`px-2 py-1 rounded ${pageFields.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {pageFields.length} fields
                                </span>
                                {modifiedOnPage > 0 && (
                                    <span className="px-2 py-1 rounded bg-amber-100 text-amber-700">
                                        {modifiedOnPage} modified
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Unpositioned fields warning */}
            {(() => {
                const unpositionedFields = form.fields.filter((f: any) => !f.position);
                if (unpositionedFields.length === 0) return null;

                return (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-amber-800 text-sm font-medium">
                                    {unpositionedFields.length} field{unpositionedFields.length !== 1 ? 's' : ''} not positioned
                                </p>
                                <p className="text-amber-700 text-xs mt-1">
                                    Enable edit mode and drag these fields to position them on the PDF
                                </p>
                                <div className="mt-1 text-xs text-amber-600">
                                    {unpositionedFields.map((f: any) => f.label).join(', ')}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
