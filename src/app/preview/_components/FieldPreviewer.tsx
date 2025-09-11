import React from 'react'
import { ArrowLeft, Plus, Edit2, Trash2, FileText, ExternalLink, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";
import { useFormStore } from '@/lib/store';
import { useForm } from '@/hooks/useForm';
import { FormFieldType } from '@/lib/types';
import { FormFieldComponent } from '@/components';

interface FormFieldsPreviewerProps {
    handleEditField: (x: FormFieldType) => void;
    handleOpenModal: () => void;
}

export default function FormFieldsPreviewer({ handleEditField, handleOpenModal }: FormFieldsPreviewerProps) {

    const { selectedForm, formData, updateFormData, clearFormData, validateFormData } = useFormStore();
    const { removeField, isRemovingField } = useForm();

    const handleDeleteField = async (fieldId: string) => {
        if (!selectedForm) return;

        if (confirm("Are you sure you want to delete this field?")) {
            try {
                await removeField({ formId: selectedForm.id, fieldId });
            } catch (error) {
                console.error("Failed to delete field:", error);
                // Error handling is already done in the hook via toast
            }
        }
    };

    const handleFormInputChange = (fieldName: string, value: any) => {
        updateFormData(fieldName, value);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateFormData();

        if (validation.isValid) {
            console.log("Form Data:", formData);
            alert("Form submitted successfully! Check console for data.");
        } else {
            console.log("Validation Errors:", validation.errors);
            alert("Please fix the form errors before submitting.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedForm?.name}</h2>
                        <p className="text-gray-600 mt-1">
                            {selectedForm?.fields.length} field{selectedForm?.fields.length !== 1 ? 's' : ''} • Manage form structure
                        </p>
                        {selectedForm?.description && (
                            <p className="text-gray-500 text-sm mt-2">{selectedForm?.description}</p>
                        )}
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        Add Field
                    </button>
                </div>

                {/* Fields List */}
                <div className="space-y-3">
                    {selectedForm?.fields.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="mb-2">No fields configured</p>
                            <p className="text-sm">Add your first field to get started</p>
                        </div>
                    ) : (
                        selectedForm?.fields.map((field) => (
                            <div
                                key={field.id}
                                className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-800">{field.label}</h3>
                                        <p className="text-sm text-gray-500">
                                            {field.name} • {field.type}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </p>
                                        {field.placeholder && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Placeholder: {field.placeholder}
                                            </p>
                                        )}
                                        {field.options && field.options.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Options: {field.options.map(opt => opt.label).join(", ")}
                                            </div>
                                        )}
                                        {field.position && (
                                            <div className="text-xs text-blue-500 mt-1">
                                                Position: Page {field.position.pdfPageNo}, X:{field.position.x}, Y:{field.position.y}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditField(field)}
                                            className="p-1 text-gray-500 hover:text-blue-600"
                                            title="Edit Field"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteField(field.id)}
                                            className="p-1 text-gray-500 hover:text-red-600"
                                            title="Delete Field"
                                            disabled={isRemovingField}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Interactive Form Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Form Preview</h3>
                    <span className="text-sm text-gray-500">Interactive preview</span>
                </div>

                {selectedForm?.fields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No fields to preview</p>
                        <p className="text-sm mt-1">Add some fields to see the form preview</p>
                    </div>
                ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {selectedForm?.fields.map((field) => (
                            <FormFieldComponent
                                key={field.id}
                                field={field}
                                value={formData[field.name]}
                                onChange={(e) => {
                                    const target = e.target;
                                    let value: any = target.value;
                                    if (field.type === 'checkbox') {
                                        const tg = e.target as HTMLInputElement
                                        const currentValues = Array.isArray(formData[field.name])
                                            ? formData[field.name] as string[]
                                            : [];

                                        if (tg.checked) {
                                            value = [...currentValues, tg.value];
                                        } else {
                                            value = currentValues.filter(v => v !== tg.value);
                                        }
                                    } else if (field.type === 'file') {
                                        value = (target as HTMLInputElement).files?.[0] || null;
                                    } else if (field.type === 'number') {
                                        value = target.value ? Number(target.value) : '';
                                    }

                                    handleFormInputChange(field.name, value);
                                }}
                            />
                        ))}

                        <div className="pt-4 border-t flex gap-3">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Test Submit
                            </button>
                            <button
                                type="button"
                                onClick={clearFormData}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Clear Form
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}