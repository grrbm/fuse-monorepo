import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Link2, FileText } from "lucide-react"

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
    onAttachExistingForm: () => void
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
                    <p className="text-lg font-semibold text-foreground mb-2">No Form Attached</p>
                    <p className="text-sm text-muted-foreground max-w-md mb-6">
                        Create a new form or attach an existing one to start building your product intake questionnaire.
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
                                    Create New Form
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => setShowFormSelector(!showFormSelector)}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Attach Existing Form
                        </Button>
                    </div>
                    {showFormSelector && (
                        <div className="mt-6 w-full max-w-md space-y-3">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Search forms..."
                                    value={formSearchQuery}
                                    onChange={(e) => setFormSearchQuery(e.target.value)}
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
                                        .map((form) => (
                                            <option key={form.id} value={form.id}>
                                                {form.title}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <Button
                                onClick={onAttachExistingForm}
                                disabled={!selectedFormId || attachingForm}
                                className="w-full"
                            >
                                {attachingForm ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Attaching...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="mr-2 h-4 w-4" />
                                        Attach Selected Form
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

