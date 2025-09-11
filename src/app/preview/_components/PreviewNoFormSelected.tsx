import { FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function PreviewNoFormSelected() {

    const router = useRouter();

    return (
        <div className="text-center py-20">
            <FileText size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No FormType Selected</h2>
            <p className="text-gray-500 mb-6">Choose a form from the dropdown above to preview it</p>
            <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go to Forms Management
            </button>
        </div>
    )
}
