import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Copy, FileText } from "lucide-react"

interface NoFormAttachedProps {
    availableForms: Array<{ id: string; title: string; description: string }>
    formSearchQuery: string
    setFormSearchQuery: (query: string) => void
    selectedFormId: string
    setSelectedFormId: (id: string) => void
    showFormSelector: boolean
    setShowFormSelector: (show: boolean) => void
    attachingForm: boolean
    creatingForm: boolean
    onCreateNewForm: () => void
    onAttachExistingForm: (mode: 'replace' | 'append') => void
}

export function NoFormAttached({
    availableForms,
    formSearchQuery,
    setFormSearchQuery,
    selectedFormId,
    setSelectedFormId,
    showFormSelector,
    setShowFormSelector,
    attachingForm,
    creatingForm,
    onCreateNewForm,
    onAttachExistingForm,
}: NoFormAttachedProps) {
    return (
        <Card className="border-dashed border-border/60">
            <CardContent className="p-12 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-2">No Form Yet</p>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                        Create a blank form or import a template to start building your product intake questionnaire.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={onCreateNewForm} disabled={creatingForm}>
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
                        <Button variant="outline" onClick={() => setShowFormSelector(!showFormSelector)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Import from Template
                        </Button>
                    </div>
                    {showFormSelector && (
                        <div className="mt-6 w-full max-w-md space-y-3">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground text-left">
                                    Templates are copied into this product - you can customize them independently.
                                </p>
                                <Input
                                    placeholder="Search templates..."
                                    value={formSearchQuery}
                                    onChange={(e) => setFormSearchQuery(e.target.value)}
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
                                        .map((form) => (
                                            <option key={form.id} value={form.id}>
                                                {form.title}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <Button
                                onClick={() => onAttachExistingForm('replace')}
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
                                        Import Selected Template
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

