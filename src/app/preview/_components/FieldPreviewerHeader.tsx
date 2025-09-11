import { useForm } from '@/hooks';
import { useFormStore } from '@/lib/store';
import React from 'react'

export default function FormFieldsPreviewerHeader({ handleFormSelection }: { handleFormSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {

    const { forms } = useForm();
    const { selectedForm } = useFormStore();

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">FormType Preview</h1>
                        <p className="mt-1 text-gray-500">Preview and test your forms</p>
                    </div>

                    {/* FormType Selector */}
                    <div className="flex items-center gap-4">
                        <label htmlFor="form-select" className="text-sm font-medium text-gray-700">
                            Select FormType:
                        </label>
                        <select
                            id="form-select"
                            value={selectedForm?.id || ''}
                            onChange={handleFormSelection}
                            className="min-w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose a form...</option>
                            {forms?.map((form) => (
                                <option key={form.id} value={form.id}>
                                    {form.name} ({form.fields.length} field{form.fields.length !== 1 ? 's' : ''})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
