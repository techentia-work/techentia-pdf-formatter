import { FormFieldType } from "@/lib/types";

interface PageThumbnailsProps {
    totalPages: number;
    currentPage: number;
    fields: FormFieldType[];
    onPageChange: (page: number) => void;
}

// Page Thumbnails Component
export default function PageThumbnails({ totalPages, currentPage, fields, onPageChange }: PageThumbnailsProps) {
    return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-t">
            <span className="text-sm font-medium text-gray-700 mr-2">Pages:</span>
            <div className="flex gap-1 max-w-full overflow-x-auto">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                    const pageFields = fields.filter(f => f.position?.pdfPageNo === pageNum);
                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`flex-shrink-0 px-3 py-1 text-xs rounded border transition-colors min-w-0 ${currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            title={`Page ${pageNum} (${pageFields.length} fields)`}
                        >
                            {pageNum}
                            {pageFields.length > 0 && (
                                <span className="ml-1 text-xs opacity-75">({pageFields.length})</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    )
}