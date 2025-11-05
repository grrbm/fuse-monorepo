import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Copy, FileText, Trash2 } from "lucide-react"

interface Template {
    id: string
    title: string
    description?: string
}

interface FormAttachmentCardProps {
    templateId: string | null
    template: Template | null
    availableForms: Array<{ id: string; title: string; description: string }>
    formSearchQuery: string
    setFormSearchQuery: (query: string) => void
    selectedFormId: string
    setSelectedFormId: (id: string) => void
    showFormSelector: boolean
    setShowFormSelector: (show: boolean) => void
    attachingForm: boolean
    detachingForm: boolean
    creatingForm: boolean
    hasSteps: boolean
    onCreateNewForm: () => void
    onAttachExistingForm: (mode: 'replace' | 'append') => void
    onSwitchForm: (formId: string, mode: 'replace' | 'append') => void
    onDetachForm: () => void
}

export function FormAttachmentCard({
    templateId,
    template,
    availableForms,
    formSearchQuery,
    setFormSearchQuery,
    selectedFormId,
    setSelectedFormId,
    showFormSelector,
    setShowFormSelector,
    attachingForm,
    detachingForm,
    creatingForm,
    hasSteps,
    onCreateNewForm,
    onAttachExistingForm,
    onSwitchForm,
    onDetachForm,
}: FormAttachmentCardProps) {
    const [showImportModeModal, setShowImportModeModal] = useState(false)
    
    const handleImportClick = () => {
        if (hasSteps && selectedFormId) {
            // Show modal to choose replace or append
            setShowImportModeModal(true)
        } else {
            // No steps, just import normally (replace)
            if (templateId) {
                onSwitchForm(selectedFormId, 'replace')
            } else {
                onAttachExistingForm('replace')
            }
        }
    }

    const handleImportModeSelect = (mode: 'replace' | 'append') => {
        setShowImportModeModal(false)
        if (templateId) {
            onSwitchForm(selectedFormId, mode)
        } else {
            onAttachExistingForm(mode)
        }
    }

    return (
        <>
        <Card className="border-border/40">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    {templateId ? (
                        <>
                            <FileText className="h-4 w-4" />
                            Product Form
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4 opacity-50" />
                            No Form Yet
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {templateId && template ? (
                    <>
                        <div>
                            <p className="font-semibold text-foreground">{template.title}</p>
                            {template.description && (
                                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowFormSelector(!showFormSelector)}
                            >
                                <Copy className="mr-2 h-3 w-3" />
                                {showFormSelector ? 'Hide Templates' : 'Replace from Template'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onDetachForm}
                                disabled={detachingForm}
                                className="text-destructive hover:text-destructive"
                            >
                                {detachingForm ? (
                                    <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Remove Form
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            This product doesn't have a form yet. Create a new one or import from a template.
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={onCreateNewForm}
                                disabled={creatingForm}
                            >
                                {creatingForm ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Blank Form
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowFormSelector(!showFormSelector)}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                {showFormSelector ? 'Hide Templates' : 'Import from Template'}
                            </Button>
                        </div>
                    </>
                )}

                {/* Form Selector Dropdown */}
                {showFormSelector && (
                    <div className="space-y-3 pt-3 border-t border-border/40">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Form Template</label>
                            <p className="text-xs text-muted-foreground">
                                Templates are copied into this product - you can customize them independently.
                            </p>
                            <Input
                                placeholder="Search templates..."
                                value={formSearchQuery}
                                onChange={(e) => setFormSearchQuery(e.target.value)}
                                className="mb-2"
                            />
                            <select
                                value={selectedFormId}
                                onChange={(e) => setSelectedFormId(e.target.value)}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select a template...</option>
                                {availableForms
                                    .filter(form =>
                                        form.title.toLowerCase().includes(formSearchQuery.toLowerCase()) ||
                                        form.description.toLowerCase().includes(formSearchQuery.toLowerCase())
                                    )
                                    .filter(form => form.id !== templateId)
                                    .map((form) => (
                                        <option key={form.id} value={form.id}>
                                            {form.title}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <Button
                            size="sm"
                            onClick={handleImportClick}
                            disabled={!selectedFormId || attachingForm}
                            className="w-full"
                        >
                            {attachingForm ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    {hasSteps ? 'Import Template' : (templateId ? 'Replace with Selected Template' : 'Import Selected Template')}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Import Mode Selection Modal */}
        {showImportModeModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImportModeModal(false)}>
                <Card className="w-full max-w-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-xl">How do you want to import this template?</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Choose how to apply the template to your form.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <button
                            className="w-full text-left rounded-xl border-2 border-border hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all p-5 group disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleImportModeSelect('replace')}
                            disabled={attachingForm}
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                                    <svg className="h-6 w-6 text-orange-600 dark:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-lg mb-1.5 text-foreground group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                                        Replace Entire Form
                                    </div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                        Delete all existing steps and replace with template steps. Your current form will be lost.
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            className="w-full text-left rounded-xl border-2 border-border hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all p-5 group disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleImportModeSelect('append')}
                            disabled={attachingForm}
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
                                    <svg className="h-6 w-6 text-teal-600 dark:text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-lg mb-1.5 text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                        Add to Bottom of Form
                                    </div>
                                    <div className="text-sm text-muted-foreground leading-relaxed">
                                        Keep your existing steps and add template steps to the bottom of your form.
                                    </div>
                                </div>
                            </div>
                        </button>

                        <div className="pt-4 border-t">
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => setShowImportModeModal(false)}
                                disabled={attachingForm}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        </>
    )
}

