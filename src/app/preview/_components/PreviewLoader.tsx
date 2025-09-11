import React from 'react'

export default function PreviewLoader() {
    return (
        <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading forms...</p>
        </div>
    )
}
