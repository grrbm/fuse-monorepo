import { ChangeEvent, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Save, X, Loader2 } from "lucide-react"

interface QuestionnaireOptionTemplate {
    id: string
    optionText: string
    optionValue?: string | null
    optionOrder: number
}

interface QuestionnaireQuestionTemplate {
    id: string
    stepId: string
    questionText: string
    answerType: string
    questionSubtype?: string | null
    questionOrder: number
    isRequired?: boolean
    helpText?: string | null
    placeholder?: string | null
    options?: QuestionnaireOptionTemplate[]
}

type EditableOption = {
    id?: string
    optionText: string
    optionValue: string
    optionOrder: number
    localKey: string
}

interface QuestionEditorProps {
    question: QuestionnaireQuestionTemplate
    stepCategory?: 'normal' | 'user_profile' | 'doctor'
    token: string | null
    baseUrl: string
    onQuestionSaved: (question: QuestionnaireQuestionTemplate) => void
    restrictStructuralEdits?: boolean
    autoEdit?: boolean
}

export function QuestionEditor({
    question,
    stepCategory,
    token,
    baseUrl,
    onQuestionSaved,
    restrictStructuralEdits = false,
    autoEdit = false
}: QuestionEditorProps) {
    const editable = Boolean(token)
    const [isEditing, setIsEditing] = useState(autoEdit)
    const [questionText, setQuestionText] = useState(question.questionText)
    const [answerType, setAnswerType] = useState<string>(question.answerType || 'radio')
    const [helpText, setHelpText] = useState(question.helpText || '')
    const [placeholder, setPlaceholder] = useState(question.placeholder || '')
    const [options, setOptions] = useState<EditableOption[]>(() =>
        (question.options ?? []).map((option, index) => ({
            id: option.id,
            optionText: option.optionText ?? '',
            optionValue: option.optionValue ?? option.optionText ?? '',
            optionOrder: option.optionOrder ?? index + 1,
            localKey: option.id ?? `existing-${index}`,
        }))
    )
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Computed values that update with state
    const isYesNoType = question.questionSubtype === 'yesno'
    const isTextArea = answerType === 'textarea' || question.answerType === 'textarea'
    const restrictOptionEdits = restrictStructuralEdits || isYesNoType

    useEffect(() => {
        if (autoEdit) {
            setIsEditing(true)
        }
    }, [autoEdit])

    useEffect(() => {
        if (!isEditing) {
            setQuestionText(question.questionText)
            setAnswerType(question.answerType || 'radio')
            setHelpText(question.helpText || '')
            setPlaceholder(question.placeholder || '')
            setOptions(
                (question.options ?? []).map((option, index) => ({
                    id: option.id,
                    optionText: option.optionText ?? '',
                    optionValue: option.optionValue ?? option.optionText ?? '',
                    optionOrder: option.optionOrder ?? index + 1,
                    localKey: option.id ?? `existing-${index}`,
                }))
            )
        }
    }, [question, isEditing])

    const handleOptionTextChange = (localKey: string, value: string) => {
        setOptions((prev) =>
            prev.map((option) =>
                option.localKey === localKey
                    ? { ...option, optionText: value }
                    : option
            )
        )
    }

    const handleOptionValueChange = (localKey: string, value: string) => {
        setOptions((prev) =>
            prev.map((option) =>
                option.localKey === localKey
                    ? { ...option, optionValue: value }
                    : option
            )
        )
    }

    const handleAddOption = () => {
        if (restrictOptionEdits) return
        setOptions((prev) => (
            [...prev, {
                id: undefined,
                optionText: '',
                optionValue: '',
                optionOrder: prev.length + 1,
                localKey: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            }]
        ))
    }

    const handleRemoveOption = (localKey: string) => {
        if (restrictOptionEdits) return
        setOptions((prev) =>
            prev
                .filter((option) => option.localKey !== localKey)
                .map((option, index) => ({ ...option, optionOrder: index + 1 }))
        )
    }

    const resetEditingState = () => {
        setIsEditing(false)
        setError(null)
        setQuestionText(question.questionText)
        setHelpText(question.helpText || '')
        setPlaceholder(question.placeholder || '')
        setOptions(
            (question.options ?? []).map((option, index) => ({
                id: option.id,
                optionText: option.optionText ?? '',
                optionValue: option.optionValue ?? option.optionText ?? '',
                optionOrder: option.optionOrder ?? index + 1,
                localKey: option.id ?? `existing-${index}`,
            }))
        )
    }

    const handleSave = async () => {
        if (!token) return

        const trimmedQuestionText = questionText.trim()
        if (!trimmedQuestionText) {
            setError('Question text is required')
            return
        }

        // Only process options for non-textarea questions
        const cleanedOptions = isTextArea ? [] : options
            .map((option, index) => {
                const trimmedText = (option.optionText || '').trim()
                const trimmedValue = (option.optionValue || '').trim()

                return {
                    id: option.id,
                    optionText: trimmedText,
                    optionValue: trimmedValue.length > 0 ? trimmedValue : trimmedText,
                    optionOrder: index + 1,
                }
            })
            .filter((option) => option.optionText.length > 0)

        setIsSaving(true)
        setError(null)

        try {
            const payload: any = {
                questionText: trimmedQuestionText,
                answerType: answerType || 'radio',
                helpText: helpText.trim() || null,
            }
            
            // Only include options for non-textarea questions
            if (!isTextArea) {
                payload.options = cleanedOptions
            }
            
            // Only include placeholder for textarea questions
            if (isTextArea) {
                payload.placeholder = placeholder.trim() || null
            }

            const response = await fetch(`${baseUrl}/questions/${question.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.message || 'Failed to save question')
            }

            const data = await response.json()
            if (data?.data) {
                onQuestionSaved(data.data)
                setQuestionText(data.data.questionText ?? trimmedQuestionText)
                setAnswerType(data.data.answerType || answerType || 'radio')
                setHelpText(data.data.helpText || '')
                setOptions(
                    (data.data.options ?? cleanedOptions).map((option: any, index: number) => ({
                        id: option.id,
                        optionText: option.optionText ?? '',
                        optionValue: option.optionValue ?? option.optionText ?? '',
                        optionOrder: option.optionOrder ?? index + 1,
                        localKey: option.id ?? `existing-${index}`,
                    }))
                )
                setIsEditing(false)
            }
        } catch (err: any) {
            console.error('❌ Error saving question:', err)
            setError(err.message || 'Unable to save question')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm space-y-4">
            {/* Header with Save Button */}
            {editable && isEditing && (
                <div className="flex items-center justify-between pb-3 border-b">
                    <h3 className="text-sm font-semibold text-foreground">Edit Question</h3>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Save
                        </Button>
                        {!autoEdit && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={resetEditingState}
                                disabled={isSaving}
                            >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Question Text */}
            <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-foreground">
                    Question Text {isEditing && <span className="text-destructive">*</span>}
                </label>
                {isEditing ? (
                    <Input
                        value={questionText}
                        onChange={(event) => setQuestionText(event.target.value)}
                        placeholder="Enter your question here..."
                        className="text-sm h-9"
                    />
                ) : (
                    <p className="text-sm font-medium text-foreground">{question.questionText}</p>
                )}
            </div>

            {/* Help Text */}
            <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">
                    Help Text <span className="text-xs">(optional)</span>
                </label>
                {isEditing ? (
                    <textarea
                        value={helpText}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHelpText(e.target.value)}
                        placeholder="Add context or instructions..."
                        className="w-full px-2.5 py-2 text-xs border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
                        rows={2}
                    />
                ) : (
                    question.helpText ? (
                        <p className="text-xs text-muted-foreground">{question.helpText}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">No help text</p>
                    )
                )}
            </div>

            {/* Placeholder (for textarea types) */}
            {isTextArea && (
                <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground">
                        Placeholder <span className="text-xs">(optional)</span>
                    </label>
                    {isEditing ? (
                        <Input
                            value={placeholder}
                            onChange={(e) => setPlaceholder(e.target.value)}
                            placeholder="e.g., Enter your response..."
                            className="text-xs h-8"
                        />
                    ) : (
                        question.placeholder ? (
                            <p className="text-xs text-muted-foreground">{question.placeholder}</p>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">No placeholder</p>
                        )
                    )}
                </div>
            )}

            {/* Textarea Preview (for textarea types) */}
            {isTextArea && (
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                        Patient View Preview
                    </label>
                    <div className="relative">
                        <textarea
                            disabled
                            placeholder={placeholder || "Type your detailed response here..."}
                            className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-lg bg-muted/30 text-muted-foreground resize-none cursor-not-allowed"
                            rows={6}
                        />
                        <div className="absolute top-2 right-2">
                            <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/50">
                                Preview
                            </span>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                        This is what patients will see. Placeholder text disappears when they start typing.
                    </p>
                </div>
            )}

            {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                </div>
            )}

            {/* Options - Read Only (Hide for textarea) */}
            {!isTextArea && question.options && question.options.length > 0 && !isEditing && (
                <div className="space-y-2">
                    <label className="block text-xs font-semibold text-foreground">
                        Options
                        {isYesNoType && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">(Yes/No)</span>
                        )}
                    </label>
                    <div className="space-y-1.5">
                        {question.options
                            ?.slice()
                            .sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
                            .map((option) => (
                                <div key={option.id ?? option.optionOrder} className="flex items-center gap-2 p-2 rounded-md bg-muted/40 border border-border/40">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary flex-shrink-0">
                                        {option.optionOrder ?? 0}
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{option.optionText}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Options - Editing (Hide for textarea) */}
            {!isTextArea && isEditing && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-foreground">
                            Options
                            {isYesNoType && (
                                <span className="ml-1 text-[10px] font-normal text-muted-foreground">(Fixed)</span>
                            )}
                        </label>
                        {!restrictOptionEdits && (
                            <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="h-7 text-xs">
                                + Add
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {options.map((option) => (
                            <div key={option.localKey} className="rounded-md border border-border p-2.5 bg-muted/20">
                                <div className="flex items-start gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary mt-1 flex-shrink-0">
                                        {option.optionOrder}
                                    </span>
                                    <div className="flex-1 space-y-2">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-medium text-muted-foreground">
                                                Text
                                            </label>
                                            <Input
                                                value={option.optionText}
                                                onChange={(event: ChangeEvent<HTMLInputElement>) => handleOptionTextChange(option.localKey, event.target.value)}
                                                placeholder="e.g., Yes"
                                                className="text-xs h-8"
                                                disabled={restrictOptionEdits}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-medium text-muted-foreground">
                                                Value <span className="opacity-70">(for logic)</span>
                                            </label>
                                            <Input
                                                value={option.optionValue}
                                                onChange={(event: ChangeEvent<HTMLInputElement>) => handleOptionValueChange(option.localKey, event.target.value)}
                                                placeholder="e.g., yes"
                                                className="text-xs h-8"
                                                disabled={restrictOptionEdits}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {options.length > 1 && !restrictOptionEdits && (
                                    <div className="flex justify-end pt-1.5 mt-1.5 border-t">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveOption(option.localKey)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 text-[10px] px-2"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuestionEditor
