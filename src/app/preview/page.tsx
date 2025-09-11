// app/preview/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useFormStore } from "@/lib/store";
import { useForm } from "@/hooks";
import { useModal } from "@/hooks";
import { AddFieldModal } from "@/components";
import { FormFieldType, FormType } from "@/lib/types";
import { FieldsPreviewer, FieldsPreviewerHeader, PreviewLoader, PreviewError, PreviewNoFormSelected, PdfPreviewer } from "./_components";
import { useRouter, useSearchParams } from "next/navigation";

export default function PreviewPage() {
    const [editingField, setEditingField] = useState<FormFieldType | null>(null);

    // Use React Query hook for forms data
    const { 
        forms, 
        formsError, 
        isFormsLoading,
        useFormById,
        addField,
        updateField,
        removeField,
        isAddingField,
        isUpdatingField,
        isRemovingField
    } = useForm();

    // Use Zustand store for local state management
    const { 
        selectedForm, 
        selectForm, 
        updateFormData, 
        formData, 
        clearFormData, 
        validateFormData 
    } = useFormStore();

    const { isOpen, openModal, closeModal } = useModal();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedFormId = searchParams?.get("selectedFormId");

    // Get individual form data if we have a selectedFormId
    const { data: individualFormData, isLoading: isIndividualFormLoading } = useFormById(selectedFormId || undefined);

    useEffect(() => {
        if (!selectedFormId) {
            router.push("/");
        }
    }, [selectedFormId, router]);

    useEffect(() => {
        if (selectedFormId && forms) {
            console.log(selectedFormId);
            const form = forms.find(f => f.id === selectedFormId);
            if (form) {
                selectForm(form);
                clearFormData();
            }
        }
    }, [selectedFormId, forms, selectForm, clearFormData]);

    // Also update selected form when individual form data is loaded
    useEffect(() => {
        if (individualFormData) {
            selectForm(individualFormData);
            clearFormData();
        }
    }, [individualFormData, selectForm, clearFormData]);

    const handleFormSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const formId = e.target.value;
        if (formId) {
            const form = forms.find(f => f.id === formId);
            if (form) {
                selectForm(form);
                clearFormData();
                // Update URL to reflect selected form
                const url = new URL(window.location.href);
                url.searchParams.set('selectedFormId', formId);
                router.push(url.pathname + url.search);
            }
        } else {
            selectForm(null);
            // Remove selectedFormId from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('selectedFormId');
            router.push(url.pathname + (url.search ? url.search : ''));
        }
    };

    const handleAddField = async (field: FormFieldType) => {
        try {
            if (!selectedForm) {
                alert("Please select a form first");
                return;
            }
            await addField({ formId: selectedForm.id, field });
            closeModal();
        } catch (error) {
            console.error("Failed to add field:", error);
        }
    };

    const handleUpdateField = async (field: FormFieldType) => {
        if (!selectedForm || !editingField) return;

        try {
            await updateField({ 
                formId: selectedForm.id, 
                fieldId: editingField.id, 
                updates: field 
            });
            setEditingField(null);
            closeModal();
        } catch (error) {
            console.error("Failed to update field:", error);
        }
    };

    const handleModalClose = () => {
        setEditingField(null);
        closeModal();
    };

    const handleEditField = (field: FormFieldType) => {
        setEditingField(field);
        openModal();
    };

    const handleOpenModal = () => {
        setEditingField(null);
        openModal();
    };

    // Show loading if either forms are loading or individual form is loading
    const isLoading = isFormsLoading || isIndividualFormLoading;

    return (
        <div className="min-h-screen bg-gray-50">
            <FieldsPreviewerHeader 
                handleFormSelection={handleFormSelection}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading && <PreviewLoader />}

                {formsError && <PreviewError />}

                {!selectedForm && !isLoading && <PreviewNoFormSelected />}

                {selectedForm && !isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <FieldsPreviewer 
                            handleEditField={handleEditField} 
                            handleOpenModal={handleOpenModal}
                        />
                        <PdfPreviewer />
                    </div>
                )}
            </div>

            {isOpen && (
                <AddFieldModal 
                    isOpen={isOpen} 
                    closeModal={handleModalClose} 
                    onAddField={editingField ? handleUpdateField : handleAddField} 
                    editingField={editingField}
                />
            )}
        </div>
    );
}