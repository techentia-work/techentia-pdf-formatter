// @/lib/store/formStore.ts
import { create } from "zustand";
import { subscribeWithSelector } from 'zustand/middleware';
import { FormType, FormFieldType, FormData, FieldPosition } from "@/lib/types";

interface PendingFieldUpdate {
  fieldId: string;
  updates: Partial<FormFieldType>;
  timestamp: number;
}

interface FormStore {
  // State
  selectedForm: FormType | null;
  selectedFields: string[];
  formData: FormData;
  pendingUpdates: { [fieldId: string]: PendingFieldUpdate };
  hasUnsavedChanges: boolean;

  // Selection operations
  selectForm: (form: FormType | null) => void;
  selectField: (fieldId: string) => void;
  deselectField: (fieldId: string) => void;
  toggleFieldSelection: (fieldId: string) => void;
  clearFieldSelection: () => void;
  selectAllFields: () => void;
  getSelectedFields: () => FormFieldType[];

  // Local field updates (doesn't call API)
  updateFieldLocally: (fieldId: string, updates: Partial<FormFieldType>) => void;
  getFieldWithUpdates: (field: FormFieldType) => FormFieldType;
  clearPendingUpdates: () => void;
  discardPendingUpdates: () => void;
  getPendingUpdatesForSave: () => { [fieldId: string]: Partial<FormFieldType> };

  // Form data management
  updateFormData: (fieldName: string, value: string | number | boolean | File | null | string[]) => void;
  clearFormData: () => void;
  resetFormData: () => void;
  validateFormData: () => { isValid: boolean; errors: { [key: string]: string } };

  // Utility methods
  findField: (fieldId: string) => FormFieldType | undefined;
  getFieldsOnPage: (pageNumber: number) => FormFieldType[];
  getFieldsWithPendingUpdates: () => FormFieldType[];
  hasFieldPendingUpdates: (fieldId: string) => boolean;
}

export const useFormStore = create<FormStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    selectedForm: null,
    selectedFields: [],
    formData: {},
    pendingUpdates: {},
    hasUnsavedChanges: false,

    // Selection operations
    selectForm: (form) => {
      set({ 
        selectedForm: form, 
        selectedFields: [], 
        formData: {},
        pendingUpdates: {},
        hasUnsavedChanges: false
      });
    },

    selectField: (fieldId) => {
      set((state) => ({
        selectedFields: state.selectedFields.includes(fieldId)
          ? state.selectedFields
          : [...state.selectedFields, fieldId],
      }));
    },

    deselectField: (fieldId) => {
      set((state) => ({
        selectedFields: state.selectedFields.filter((id) => id !== fieldId),
      }));
    },

    toggleFieldSelection: (fieldId) => {
      set((state) => ({
        selectedFields: state.selectedFields.includes(fieldId)
          ? state.selectedFields.filter((id) => id !== fieldId)
          : [...state.selectedFields, fieldId],
      }));
    },

    clearFieldSelection: () => {
      set({ selectedFields: [] });
    },

    selectAllFields: () => {
      const { selectedForm } = get();
      if (selectedForm?.fields) {
        set({ selectedFields: selectedForm.fields.map(f => f.id) });
      }
    },

    getSelectedFields: () => {
      const { selectedForm, selectedFields, getFieldWithUpdates } = get();
      if (!selectedForm?.fields) return [];
      return selectedForm.fields
        .filter(field => selectedFields.includes(field.id))
        .map(field => getFieldWithUpdates(field));
    },

    // Local field updates
    updateFieldLocally: (fieldId, updates) => {
      const state = get();
      const existingUpdate = state.pendingUpdates[fieldId];
      
      // Merge with existing pending updates for this field
      const mergedUpdates = existingUpdate 
        ? { ...existingUpdate.updates, ...updates }
        : updates;

      set((state) => ({
        pendingUpdates: {
          ...state.pendingUpdates,
          [fieldId]: {
            fieldId,
            updates: mergedUpdates,
            timestamp: Date.now()
          }
        },
        hasUnsavedChanges: true
      }));
    },

    getFieldWithUpdates: (field) => {
      const { pendingUpdates } = get();
      const pending = pendingUpdates[field.id];
      
      if (!pending) return field;

      return {
        ...field,
        ...pending.updates
      };
    },

    clearPendingUpdates: () => {
      set({ 
        pendingUpdates: {}, 
        hasUnsavedChanges: false 
      });
    },

    discardPendingUpdates: () => {
      set({ 
        pendingUpdates: {}, 
        hasUnsavedChanges: false 
      });
    },

    getPendingUpdatesForSave: () => {
      const { pendingUpdates } = get();
      const updatesForSave: { [fieldId: string]: Partial<FormFieldType> } = {};
      
      Object.entries(pendingUpdates).forEach(([fieldId, pendingUpdate]) => {
        updatesForSave[fieldId] = pendingUpdate.updates;
      });
      
      return updatesForSave;
    },

    // Form data management
    updateFormData: (fieldName, value) => {
      set((state) => ({
        formData: {
          ...state.formData,
          [fieldName]: value,
        },
      }));
    },

    clearFormData: () => {
      set({ formData: {} });
    },

    resetFormData: () => {
      const { selectedForm } = get();
      if (!selectedForm?.fields) return;

      const initialData: FormData = {};
      selectedForm.fields.forEach(field => {
        switch (field.type) {
          case 'checkbox':
            initialData[field.name] = [];
            break;
          case 'number':
            initialData[field.name] = '';
            break;
          case 'file':
            initialData[field.name] = null;
            break;
          default:
            initialData[field.name] = '';
        }
      });

      set({ formData: initialData });
    },

    validateFormData: () => {
      const { selectedForm, formData, getFieldWithUpdates } = get();
      if (!selectedForm?.fields) return { isValid: true, errors: {} };

      const errors: { [key: string]: string } = {};

      selectedForm.fields.forEach(field => {
        const fieldWithUpdates = getFieldWithUpdates(field);
        const value = formData[fieldWithUpdates.name];
        
        if (fieldWithUpdates.required) {
          if (fieldWithUpdates.type === 'checkbox' && (!Array.isArray(value) || value.length === 0)) {
            errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} is required`;
          } else if (fieldWithUpdates.type === 'file' && !value) {
            errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} is required`;
          } else if (!value || (typeof value === 'string' && !value.trim())) {
            errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} is required`;
          }
        }

        if (value && fieldWithUpdates.validation) {
          const val = fieldWithUpdates.validation;
          const stringValue = String(value);

          if (val.minLength && stringValue.length < val.minLength) {
            errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} must be at least ${val.minLength} characters`;
          }
          if (val.maxLength && stringValue.length > val.maxLength) {
            errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} must be no more than ${val.maxLength} characters`;
          }
          if (fieldWithUpdates.type === 'number') {
            const numValue = Number(value);
            if (val.min !== undefined && numValue < val.min) {
              errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} must be at least ${val.min}`;
            }
            if (val.max !== undefined && numValue > val.max) {
              errors[fieldWithUpdates.name] = `${fieldWithUpdates.label} must be no more than ${val.max}`;
            }
          }
        }
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },

    // Utility methods
    findField: (fieldId) => {
      const { selectedForm } = get();
      return selectedForm?.fields.find(field => field.id === fieldId);
    },

    getFieldsOnPage: (pageNumber) => {
      const { selectedForm, getFieldWithUpdates } = get();
      if (!selectedForm?.fields) return [];
      
      return selectedForm.fields
        .filter(field => {
          const fieldWithUpdates = getFieldWithUpdates(field);
          return fieldWithUpdates.position?.pdfPageNo === pageNumber;
        })
        .map(field => getFieldWithUpdates(field));
    },

    getFieldsWithPendingUpdates: () => {
      const { selectedForm, pendingUpdates, getFieldWithUpdates } = get();
      if (!selectedForm?.fields) return [];
      
      return selectedForm.fields
        .filter(field => pendingUpdates[field.id])
        .map(field => getFieldWithUpdates(field));
    },

    hasFieldPendingUpdates: (fieldId) => {
      const { pendingUpdates } = get();
      return !!pendingUpdates[fieldId];
    }
  }))
);

// Selector hooks for better performance
export const useSelectedForm = () => useFormStore(state => state.selectedForm);
export const useSelectedFields = () => useFormStore(state => state.selectedFields);
export const useFormData = () => useFormStore(state => state.formData);
export const usePendingUpdates = () => useFormStore(state => state.pendingUpdates);
export const useHasUnsavedChanges = () => useFormStore(state => state.hasUnsavedChanges);

// Compound selectors for common combinations
export const useFieldSelection = () => useFormStore(state => ({
  selectedFields: state.selectedFields,
  selectField: state.selectField,
  deselectField: state.deselectField,
  toggleFieldSelection: state.toggleFieldSelection,
  clearFieldSelection: state.clearFieldSelection,
  selectAllFields: state.selectAllFields,
  getSelectedFields: state.getSelectedFields
}));

export const useFieldUpdates = () => useFormStore(state => ({
  pendingUpdates: state.pendingUpdates,
  hasUnsavedChanges: state.hasUnsavedChanges,
  updateFieldLocally: state.updateFieldLocally,
  getFieldWithUpdates: state.getFieldWithUpdates,
  clearPendingUpdates: state.clearPendingUpdates,
  discardPendingUpdates: state.discardPendingUpdates,
  getPendingUpdatesForSave: state.getPendingUpdatesForSave,
  getFieldsWithPendingUpdates: state.getFieldsWithPendingUpdates,
  hasFieldPendingUpdates: state.hasFieldPendingUpdates
}));