import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  Settings,
  Loader2,
  Save,
  X,
} from "lucide-react"

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
  options?: QuestionnaireOptionTemplate[]
}

interface QuestionnaireStepTemplate {
  id: string
  title: string
  description?: string | null
  stepOrder: number
  category?: 'normal' | 'user_profile' | 'doctor'
  questions?: QuestionnaireQuestionTemplate[]
}

interface QuestionnaireTemplate {
  id: string
  title: string
  description?: string | null
  checkoutStepPosition: number
  treatmentId: string | null
  isTemplate?: boolean
  steps?: QuestionnaireStepTemplate[]
}

export default function Forms() {
  const { token } = useAuth()
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireTemplate[]>([])
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editorQuestionnaire, setEditorQuestionnaire] = useState<QuestionnaireTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)

  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', [])

  const updateStoredQuestionnaire = (updated: QuestionnaireTemplate) => {
    setQuestionnaires((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    )
    setEditorQuestionnaire(updated)
  }

  useEffect(() => {
    const loadData = async () => {
      if (!token) return
      setLoading(true)
      setError(null)

      try {
        const [templatesRes, questionnairesRes] = await Promise.all([
          fetch(`${baseUrl}/questionnaires/templates`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${baseUrl}/questionnaires`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (!templatesRes.ok) {
          throw new Error('Failed to load templates')
        }

        if (!questionnairesRes.ok) {
          throw new Error('Failed to load questionnaires')
        }

        const templatesData = await templatesRes.json()
        const questionnairesData = await questionnairesRes.json()

        setQuestionnaires(questionnairesData.data || [])
        setTemplates(templatesData.data || [])
      } catch (err: any) {
        console.error('❌ Error loading questionnaires:', err)
        setError(err.message || 'Failed to load questionnaires')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token])

  const handleEditQuestionnaire = async (id: string) => {
    if (!token) return
    setSelectedQuestionnaire(id)
    setShowEditor(true)

    try {
      const res = await fetch(`${baseUrl}/questionnaires/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to load questionnaire')
      }

      const data = await res.json()
      setEditorQuestionnaire(data.data)
    } catch (err) {
      console.error('❌ Error loading questionnaire for editor:', err)
    }
  }

  const handleQuestionSaved = (updatedQuestion: QuestionnaireQuestionTemplate) => {
    if (!updatedQuestion) return

    setEditorQuestionnaire((prev) => {
      if (!prev?.steps) return prev

      const updatedSteps = prev.steps.map((step) => {
        if (step.id !== updatedQuestion.stepId) return step

        const updatedQuestions = step.questions?.map((question) =>
          question.id === updatedQuestion.id
            ? {
              ...question,
              ...updatedQuestion,
              options: updatedQuestion.options ?? []
            }
            : question
        )

        return {
          ...step,
          questions: updatedQuestions
        }
      })

      const updated = {
        ...prev,
        steps: updatedSteps
      }

      setQuestionnaires((prevQuestionnaires) =>
        prevQuestionnaires.map((questionnaire) =>
          questionnaire.id === updated.id ? updated : questionnaire
        )
      )

      return updated
    })
  }

  const handleImportTemplate = async (templateId: string) => {
    if (!token) return
    setIsImporting(true)
    setTemplateError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to import template')
      }

      const data = await response.json()
      if (data?.data) {
        setQuestionnaires((prev) => [data.data, ...prev])
      }

      setShowTemplateModal(false)
    } catch (err: any) {
      console.error('❌ Error importing template:', err)
      setTemplateError(err.message || 'Unable to import template')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Form Management</h1>
              <p className="text-muted-foreground">Create and manage questionnaire templates</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Import Template
              </Button>
            </div>
          </div>

          {error && (
            <Card className="border-destructive/40 bg-destructive/10">
              <CardContent className="p-4 text-sm text-destructive">
                {error}
              </CardContent>
            </Card>
          )}

          {loading ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading questionnaires...
              </CardContent>
            </Card>
          ) : showEditor ? (
            <QuestionnaireEditor
              questionnaire={editorQuestionnaire}
              onBack={() => setShowEditor(false)}
              token={token}
              baseUrl={baseUrl}
              onQuestionSaved={handleQuestionSaved}
            />
          ) : (
            <>
              {/* Questionnaire List */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Available Questionnaires</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your questionnaire templates and create customized versions</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questionnaires.map((questionnaire) => (
                      <div key={questionnaire.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{questionnaire.title}</h4>
                            <p className="text-sm text-muted-foreground">{questionnaire.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>{questionnaire.steps?.length || 0} steps</span>
                              <span>
                                {questionnaire.steps?.reduce((total, step) => total + (step.questions?.length || 0), 0) || 0} questions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestionnaire(questionnaire.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Total Templates</h3>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-foreground">{questionnaires.length}</p>
                      <p className="text-xs text-muted-foreground">Questionnaires available for your clinic</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Available Templates</h3>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-foreground">{templates.length}</p>
                      <p className="text-xs text-muted-foreground">Reusable templates</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Usage Rate</h3>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-foreground">89%</p>
                      <p className="text-xs text-muted-foreground">Forms actively in use</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Import Template</CardTitle>
                <CardDescription>Select a template to duplicate into your clinic.</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>
                Close
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {templateError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/40 px-3 py-2 text-sm text-destructive">
                  {templateError}
                </div>
              )}

              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No templates available.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium text-foreground">{template.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {template.description || 'No description provided.'}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>{template.steps?.length || 0} steps</span>
                            <span>
                              {template.steps?.reduce((total, step) => total + (step.questions?.length || 0), 0) || 0} questions
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleImportTemplate(template.id)}
                          disabled={isImporting}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing
                            </>
                          ) : (
                            'Import'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Questionnaire Visual Editor Component
function QuestionnaireEditor({
  questionnaire,
  onBack,
  token,
  baseUrl,
  onQuestionSaved,
}: {
  questionnaire: QuestionnaireTemplate | null
  onBack: () => void
  token: string | null
  baseUrl: string
  onQuestionSaved: (question: QuestionnaireQuestionTemplate) => void
}) {
  const steps = questionnaire?.steps ?? []

  const getCategoryStyles = (category?: string) => {
    switch (category) {
      case 'user_profile':
        return {
          container: 'bg-emerald-950/5 border-emerald-300/60',
          badge: 'bg-emerald-500/20 text-emerald-700',
          chip: 'bg-emerald-500/15 text-emerald-800 border border-emerald-400/60'
        }
      case 'doctor':
        return {
          container: 'bg-rose-950/5 border-rose-300/60',
          badge: 'bg-rose-500/20 text-rose-700',
          chip: 'bg-rose-500/15 text-rose-800 border border-rose-400/60'
        }
      case 'normal':
      default:
        return {
          container: 'bg-sky-950/5 border-sky-300/60',
          badge: 'bg-sky-500/20 text-sky-700',
          chip: 'bg-sky-500/15 text-sky-800 border border-sky-400/60'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            ← Back to Forms
          </Button>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{questionnaire?.title || 'Questionnaire'} - Editor</h2>
          <p className="text-muted-foreground">Review and manage questionnaire steps</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" disabled>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button disabled>
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Questionnaire Steps</CardTitle>
          <p className="text-sm text-muted-foreground">{steps.length} total steps</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.length === 0 ? (
              <div className="text-sm text-muted-foreground">No steps available for this questionnaire.</div>
            ) : (
              steps
                .slice()
                .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
                .map((step) => {
                  const styles = getCategoryStyles(step.category)
                  return (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg border ${styles.container}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${styles.badge}`}>
                              {step.stepOrder ?? 0}
                            </span>
                            <h4 className="font-medium text-foreground">{step.title}</h4>
                          </div>
                          <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${styles.chip}`}>
                            <span>Category:</span>
                            <span>{step.category || 'normal'}</span>
                          </div>
                          {step.description && (
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {(step.questions?.length || 0)} questions
                          </div>
                        </div>
                      </div>

                      {step.questions && step.questions.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
                          {step.questions
                            .slice()
                            .sort((a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0))
                            .map((question) => (
                              <QuestionEditorCard
                                key={question.id}
                                question={question}
                                stepCategory={step.category}
                                token={token}
                                baseUrl={baseUrl}
                                onQuestionSaved={onQuestionSaved}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type EditableOption = {
  id?: string
  optionText: string
  optionValue: string
  optionOrder: number
  localKey: string
}

function QuestionEditorCard({
  question,
  stepCategory,
  token,
  baseUrl,
  onQuestionSaved,
}: {
  question: QuestionnaireQuestionTemplate
  stepCategory?: 'normal' | 'user_profile' | 'doctor'
  token: string | null
  baseUrl: string
  onQuestionSaved: (question: QuestionnaireQuestionTemplate) => void
}) {
  const editable = stepCategory === 'normal' && Boolean(token)
  const [isEditing, setIsEditing] = useState(false)
  const [questionText, setQuestionText] = useState(question.questionText)
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

  const handleOptionChange = (localKey: string, field: 'optionText' | 'optionValue', value: string) => {
    setOptions((prev) =>
      prev.map((option) =>
        option.localKey === localKey
          ? { ...option, [field]: value }
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
      .map((option, index) => ({
        id: option.id,
        optionText: option.optionText.trim(),
        optionValue: (option.optionValue || option.optionText).trim(),
        optionOrder: index + 1,
      }))
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
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Type: {question.answerType}
          </div>
        </div>

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
                    onChange={(event) => handleOptionChange(option.localKey, 'optionText', event.target.value)}
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
                    onChange={(event) => handleOptionChange(option.localKey, 'optionValue', event.target.value)}
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