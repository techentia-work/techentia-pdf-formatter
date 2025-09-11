import { useForm } from '@/hooks';
import React from 'react'

export default function PreviewError() {
    const { formsError } = useForm();
    return (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <p className="text-red-700">{formsError?.message}</p>
        </div>
    )
}
