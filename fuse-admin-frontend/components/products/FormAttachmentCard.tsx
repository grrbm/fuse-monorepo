import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Link2, Unlink } from "lucide-react"

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
    onCreateNewForm: () => void
    onAttachExistingForm: () => void
    onSwitchForm: (formId: string) => void
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
    onCreateNewForm,
    onAttachExistingForm,
    onSwitchForm,
    onDetachForm,
}: FormAttachmentCardProps) {
    return (
        <Card className="border-border/40">
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    {templateId ? (
                        <>
                            <Link2 className="h-4 w-4" />
                            Form Attached
                        </>
                    ) : (
                        <>
                            <Unlink className="h-4 w-4" />
                            No Form Attached
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
                                {showFormSelector ? 'Hide' : 'Switch Form'}
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
                                        Detaching...
                                    </>
                                ) : (
                                    <>
                                        <Unlink className="mr-2 h-3 w-3" />
                                        Detach
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            This product does not have an associated form. Create a new one or attach an existing form.
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
                                        Create New Form
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowFormSelector(!showFormSelector)}
                            >
                                {showFormSelector ? 'Hide' : 'Attach Existing Form'}
                            </Button>
                        </div>
                    </>
                )}

                {/* Form Selector Dropdown */}
                {showFormSelector && (
                    <div className="space-y-3 pt-3 border-t border-border/40">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search & Select Form</label>
                            <Input
                                placeholder="Search forms..."
                                value={formSearchQuery}
                                onChange={(e) => setFormSearchQuery(e.target.value)}
                                className="mb-2"
                            />
                            <select
                                value={selectedFormId}
                                onChange={(e) => setSelectedFormId(e.target.value)}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select a form...</option>
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
                            onClick={() => {
                                if (templateId) {
                                    onSwitchForm(selectedFormId)
                                } else {
                                    onAttachExistingForm()
                                }
                            }}
                            disabled={!selectedFormId || attachingForm}
                            className="w-full"
                        >
                            {attachingForm ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {templateId ? 'Switching...' : 'Attaching...'}
                                </>
                            ) : (
                                <>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    {templateId ? 'Switch to Selected Form' : 'Attach Selected Form'}
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

