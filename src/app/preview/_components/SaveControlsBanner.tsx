import { Loader2, Save } from "lucide-react";

interface SaveControlsBannerProps {
    hasUnsavedChanges: boolean;
    pendingCount: number;
    isSaving: boolean;
    onSave: () => void;
    onDiscard: () => void;
}

// Save Controls Component
export default function SaveControlsBanner({ hasUnsavedChanges, pendingCount, isSaving, onSave, onDiscard }: SaveControlsBannerProps) {
    if (!hasUnsavedChanges) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-100 rounded p-2">
                        <Save size={16} className="text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-amber-800 font-medium">
                            {pendingCount} field{pendingCount !== 1 ? 's' : ''} modified
                        </h4>
                        <p className="text-amber-700 text-sm">Changes are stored locally and need to be saved</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onDiscard}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm border border-amber-300 text-amber-700 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                        Discard
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};