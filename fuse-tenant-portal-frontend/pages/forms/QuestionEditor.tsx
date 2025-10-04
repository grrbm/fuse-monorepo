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
    questionOrder: number
    isRequired?: boolean
    helpText?: string | null
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
}

export function QuestionEditor({
    question,
    stepCategory,
    token,
    baseUrl,
    onQuestionSaved
}: QuestionEditorProps) {
    const editable = stepCategory === 'normal' && Boolean(token)
    const [isEditing, setIsEditing] = useState(false)
    const [questionText, setQuestionText] = useState(question.questionText)
    const [helpText, setHelpText] = useState(question.helpText || '')
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

    useEffect(() => {
        if (!isEditing) {
            setQuestionText(question.questionText)
            setHelpText(question.helpText || '')
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

        const cleanedOptions = options
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
            const response = await fetch(`${baseUrl}/questions/${question.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    questionText: trimmedQuestionText,
                    helpText: helpText.trim() || null,
                    options: cleanedOptions,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                throw new Error(data.message || 'Failed to save question')
            }

            const data = await response.json()
            if (data?.data) {
                onQuestionSaved(data.data)
                setQuestionText(data.data.questionText ?? trimmedQuestionText)
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
        <div className="rounded-md border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                            {question.questionOrder ?? 0}
                        </span>
                        {isEditing ? (
                            <Input
                                value={questionText}
                                onChange={(event) => setQuestionText(event.target.value)}
                                placeholder="Question text"
                                className="text-sm"
                            />
                        ) : (
                            <span className="font-medium text-foreground">{question.questionText}</span>
                        )}
                    </div>
                    {isEditing ? (
                        <textarea
                            value={helpText}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setHelpText(e.target.value)}
                            placeholder="Help text (optional)"
                            className="w-full px-3 py-2 text-xs border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                            rows={2}
                        />
                    ) : (
                        question.helpText && (
                            <p className="text-xs text-muted-foreground italic">{question.helpText}</p>
                        )
                    )}
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Type: {question.answerType}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {editable && (
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={resetEditingState}
                                        disabled={isSaving}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {error}
                </div>
            )}

            {question.options && question.options.length > 0 && !isEditing && (
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {question.options
                        ?.slice()
                        .sort((a, b) => (a.optionOrder ?? 0) - (b.optionOrder ?? 0))
                        .map((option) => (
                            <div key={option.id ?? option.optionOrder} className="flex items-center gap-2">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-medium">
                                    {option.optionOrder ?? 0}
                                </span>
                                <span className="font-medium text-foreground">{option.optionText}</span>
                                <span className="text-muted-foreground">({option.optionValue})</span>
                            </div>
                        ))}
                </div>
            )}

            {isEditing && (
                <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span>Options</span>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                            + Add option
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {options.map((option) => (
                            <div key={option.localKey} className="flex flex-col gap-2 rounded border border-border/60 p-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-medium text-foreground">
                                        {option.optionOrder}
                                    </span>
                                    <Input
                                        value={option.optionText}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => handleOptionTextChange(option.localKey, event.target.value)}
                                        placeholder="Option text"
                                        className="text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-medium text-foreground opacity-0">
                                        {option.optionOrder}
                                    </span>
                                    <Input
                                        value={option.optionValue}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => handleOptionValueChange(option.localKey, event.target.value)}
                                        placeholder="Option value"
                                        className="text-xs"
                                    />
                                </div>
                                {options.length > 1 && (
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveOption(option.localKey)}
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
