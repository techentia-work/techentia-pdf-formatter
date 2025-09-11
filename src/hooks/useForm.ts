// @/hooks/useForm.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormService } from "@/lib/services";
import { FormType, FormFieldType } from "@/lib/types";
import toast from "react-hot-toast";

export function useForm() {
  const queryClient = useQueryClient();

  const { data: forms = [], error: formsError, isLoading: isFormsLoading, refetch: refetchForms } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const res = await FormService.getForms();
      return res.forms;
    },
  });

  const useFormById = (formId: string | undefined) => {
    return useQuery({
      queryKey: ["forms", formId],
      queryFn: async () => {
        if (!formId) throw new Error("Form ID is required");
        return await FormService.getForm(formId);
      },
      enabled: !!formId,
      staleTime: 2 * 60 * 1000,
    });
  };

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: (formData: Omit<FormType, "id" | "createdAt" | "updatedAt">) =>
      FormService.createForm(formData),
    onSuccess: (newForm) => {
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? [...old, newForm] : [newForm]
      );
      toast.success("Form created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create form: ${error.message}`);
    },
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<FormType> }) =>
      FormService.updateForm(id, updates),
    onSuccess: (updatedForm, variables) => {
      // Update forms list cache
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.map((form) => (form.id === variables.id ? updatedForm : form)) : [updatedForm]
      );
      // Update individual form cache
      queryClient.setQueryData(["forms", variables.id], updatedForm);
      toast.success("Form updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update form: ${error.message}`);
    },
  });

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: (id: string) => FormService.deleteForm(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.filter((form) => form.id !== deletedId) : []
      );
      queryClient.removeQueries({ queryKey: ["forms", deletedId] });
      toast.success("Form deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete form: ${error.message}`);
    },
  });

  // Add field mutation
  const addFieldMutation = useMutation({
    mutationFn: ({ formId, field }: { formId: string; field: FormFieldType }) =>
      FormService.addField(formId, field),
    onSuccess: (updatedForm, variables) => {
      // Update both caches
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.map((form) => (form.id === variables.formId ? updatedForm : form)) : [updatedForm]
      );
      queryClient.setQueryData(["forms", variables.formId], updatedForm);
      toast.success("Field added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add field: ${error.message}`);
    },
  });

  // Update field mutation
  const updateFieldMutation = useMutation({
    mutationFn: ({
      formId,
      fieldId,
      updates
    }: {
      formId: string;
      fieldId: string;
      updates: Partial<FormFieldType>
    }) =>
      FormService.updateField(formId, fieldId, updates),
    onSuccess: (updatedForm, variables) => {
      // Update both caches
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.map((form) => (form.id === variables.formId ? updatedForm : form)) : [updatedForm]
      );
      queryClient.setQueryData(["forms", variables.formId], updatedForm);
      toast.success("Field updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update field: ${error.message}`);
    },
  });

  // Batch update fields mutation
  const batchUpdateFieldsMutation = useMutation({
    mutationFn: async ({
      formId,
      fieldUpdates
    }: {
      formId: string;
      fieldUpdates: { [fieldId: string]: Partial<FormFieldType> }
    }) => {
      // Execute all updates sequentially
      let updatedForm = await FormService.getForm(formId);

      for (const [fieldId, updates] of Object.entries(fieldUpdates)) {
        updatedForm = await FormService.updateField(formId, fieldId, updates);
      }

      return { updatedForm, fieldCount: Object.keys(fieldUpdates).length };
    },
    onSuccess: ({ updatedForm, fieldCount }, variables) => {
      // Update both caches
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.map((form) => (form.id === variables.formId ? updatedForm : form)) : [updatedForm]
      );
      queryClient.setQueryData(["forms", variables.formId], updatedForm);
      toast.success(`${fieldCount} field${fieldCount !== 1 ? 's' : ''} updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fields: ${error.message}`);
    },
  });

  // Remove field mutation
  const removeFieldMutation = useMutation({
    mutationFn: ({ formId, fieldId }: { formId: string; fieldId: string }) =>
      FormService.removeField(formId, fieldId),
    onSuccess: (updatedForm, variables) => {
      // Update both caches
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.map((form) => (form.id === variables.formId ? updatedForm : form)) : [updatedForm]
      );
      queryClient.setQueryData(["forms", variables.formId], updatedForm);
      toast.success("Field removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove field: ${error.message}`);
    },
  });

  // Bulk operations
  const deleteMultipleFieldsMutation = useMutation({
    mutationFn: async ({ formId, fieldIds }: { formId: string; fieldIds: string[] }) => {
      let updatedForm = await FormService.getForm(formId);

      for (const fieldId of fieldIds) {
        updatedForm = await FormService.removeField(formId, fieldId);
      }

      return { updatedForm, fieldCount: fieldIds.length };
    },
    onSuccess: ({ updatedForm, fieldCount }, variables) => {
      queryClient.setQueryData<FormType[]>(["forms"], (old) =>
        old ? old.map((form) => (form.id === variables.formId ? updatedForm : form)) : [updatedForm]
      );
      queryClient.setQueryData(["forms", variables.formId], updatedForm);
      toast.success(`${fieldCount} field${fieldCount !== 1 ? 's' : ''} deleted successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete multiple fields: ${error.message}`);
    },
  });

  // Invalidate queries helper
  const invalidateFormQueries = (formId?: string) => {
    if (formId) {
      queryClient.invalidateQueries({ queryKey: ["forms", formId], });
    }
    queryClient.invalidateQueries({ queryKey: ["forms"] });
  };

  // Helper to get cached form
  const getCachedForm = (formId: string): FormType | undefined => {
    return queryClient.getQueryData(["forms", formId]);
  };

  return {
    // Data
    forms,
    formsError,
    isFormsLoading,

    // Single form hook
    useFormById,

    // Mutations
    createForm: createFormMutation.mutateAsync,
    updateForm: updateFormMutation.mutateAsync,
    deleteForm: deleteFormMutation.mutateAsync,
    addField: addFieldMutation.mutateAsync,
    updateField: updateFieldMutation.mutateAsync,
    batchUpdateFields: batchUpdateFieldsMutation.mutateAsync,
    removeField: removeFieldMutation.mutateAsync,
    deleteMultipleFields: deleteMultipleFieldsMutation.mutateAsync,

    // Loading states
    isCreatingForm: createFormMutation.isPending,
    isUpdatingForm: updateFormMutation.isPending,
    isDeletingForm: deleteFormMutation.isPending,
    isAddingField: addFieldMutation.isPending,
    isUpdatingField: updateFieldMutation.isPending,
    isBatchUpdating: batchUpdateFieldsMutation.isPending,
    isRemovingField: removeFieldMutation.isPending,
    isDeletingMultipleFields: deleteMultipleFieldsMutation.isPending,

    // Utilities
    refetchForms,
    invalidateFormQueries,
    getCachedForm,
  };
}