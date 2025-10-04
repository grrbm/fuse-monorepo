import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Loader2,
  Copy,
} from "lucide-react"
import { QuestionnaireEditor } from "./QuestionnaireEditor"

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [questionnaireToDelete, setQuestionnaireToDelete] = useState<QuestionnaireTemplate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleStepSaved = (updatedStep: QuestionnaireStepTemplate) => {
    if (!updatedStep) return

    setEditorQuestionnaire((prev) => {
      if (!prev?.steps) return prev

      const updatedSteps = prev.steps.map((step) =>
        step.id === updatedStep.id ? updatedStep : step
      )

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

  const handleStepReordered = async (stepId: string, direction: 'up' | 'down') => {
    if (!token || !editorQuestionnaire) return

    try {
      // Get all steps with the same category (normal)
      const normalSteps = (editorQuestionnaire.steps || [])
        .filter(step => step.category === 'normal')
        .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))

      const currentIndex = normalSteps.findIndex(step => step.id === stepId)
      if (currentIndex === -1) return

      // Determine target index
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= normalSteps.length) return

      // Swap step orders
      const currentStep = normalSteps[currentIndex]
      const targetStep = normalSteps[targetIndex]

      const tempOrder = currentStep.stepOrder
      currentStep.stepOrder = targetStep.stepOrder
      targetStep.stepOrder = tempOrder

      // Update local state immediately for better UX
      setEditorQuestionnaire((prev) => {
        if (!prev?.steps) return prev

        const updatedSteps = prev.steps.map((step) => {
          if (step.id === currentStep.id) {
            return { ...step, stepOrder: currentStep.stepOrder }
          }
          if (step.id === targetStep.id) {
            return { ...step, stepOrder: targetStep.stepOrder }
          }
          return step
        })

        return { ...prev, steps: updatedSteps }
      })

      // Update in database
      const response = await fetch(`${baseUrl}/questionnaires/step/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stepId,
          direction
        }),
      })

      if (!response.ok) {
        // Revert on error
        const tempOrder = currentStep.stepOrder
        currentStep.stepOrder = targetStep.stepOrder
        targetStep.stepOrder = tempOrder

        setEditorQuestionnaire((prev) => {
          if (!prev?.steps) return prev

          const updatedSteps = prev.steps.map((step) => {
            if (step.id === currentStep.id) {
              return { ...step, stepOrder: currentStep.stepOrder }
            }
            if (step.id === targetStep.id) {
              return { ...step, stepOrder: targetStep.stepOrder }
            }
            return step
          })

          return { ...prev, steps: updatedSteps }
        })

        throw new Error('Failed to reorder step')
      }

    } catch (err: any) {
      console.error('❌ Error reordering step:', err)
      setError(err.message || 'Unable to reorder step')
    }
  }

  const handleImportTemplate = async (templateId: string) => {
    if (!token) return
    setIsImporting(true)
    setTemplateError(null)

    try {
      // Find the template to get its treatmentId
      const template = templates.find(t => t.id === templateId)
      if (!template) {
        throw new Error('Template not found')
      }

      // Check if user already has a questionnaire for this treatment
      const existingQuestionnaire = questionnaires.find(q =>
        q.treatmentId === template.treatmentId && !q.isTemplate
      )

      if (existingQuestionnaire) {
        throw new Error(`You already have a questionnaire for this treatment. Please delete "${existingQuestionnaire.title}" first before importing again.`)
      }

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

  const handleDeleteQuestionnaire = async () => {
    if (!token || !questionnaireToDelete) return
    setIsDeleting(true)

    try {
      const response = await fetch(`${baseUrl}/questionnaires/${questionnaireToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to delete questionnaire')
      }

      // Remove from local state
      setQuestionnaires((prev) => prev.filter(q => q.id !== questionnaireToDelete.id))
      setShowDeleteModal(false)
      setQuestionnaireToDelete(null)
    } catch (err: any) {
      console.error('❌ Error deleting questionnaire:', err)
      setError(err.message || 'Unable to delete questionnaire')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (questionnaire: QuestionnaireTemplate) => {
    setQuestionnaireToDelete(questionnaire)
    setShowDeleteModal(true)
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
              onStepSaved={handleStepSaved}
              onStepReordered={handleStepReordered}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmDelete(questionnaire)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
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
                  {templates.map((template) => {
                    // Check if user already has a questionnaire for this treatment
                    const existingQuestionnaire = questionnaires.find(q =>
                      q.treatmentId === template.treatmentId && !q.isTemplate
                    )
                    const isAlreadyImported = !!existingQuestionnaire

                    return (
                      <div key={template.id} className={`border rounded-lg p-4 ${isAlreadyImported ? 'border-amber-300/60 bg-amber-50/50' : 'border-border'}`}>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">{template.title}</h3>
                              {isAlreadyImported && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                  Already Imported
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {template.description || 'No description provided.'}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span>{template.steps?.length || 0} steps</span>
                              <span>
                                {template.steps?.reduce((total, step) => total + (step.questions?.length || 0), 0) || 0} questions
                              </span>
                            </div>
                            {isAlreadyImported && (
                              <p className="text-xs text-amber-600">
                                You have: "{existingQuestionnaire?.title}"
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleImportTemplate(template.id)}
                            disabled={isImporting || isAlreadyImported}
                            variant={isAlreadyImported ? "outline" : "default"}
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing
                              </>
                            ) : isAlreadyImported ? (
                              'Already Imported'
                            ) : (
                              'Import'
                            )}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && questionnaireToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Questionnaire</CardTitle>
              <CardDescription>
                Are you sure you want to delete "{questionnaireToDelete.title}"? This action cannot be undone and will permanently remove:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <ul className="text-sm text-destructive space-y-1">
                  <li>• The questionnaire and all its steps</li>
                  <li>• All questions within each step</li>
                  <li>• All question options</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setQuestionnaireToDelete(null)
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteQuestionnaire}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

