import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

interface QuestionnaireTemplate {
  id: string
  title: string
  description?: string | null
  checkoutStepPosition: number
  treatmentId: string | null
  isTemplate?: boolean
  steps?: Array<{
    id: string
    title: string
    description?: string | null
    stepOrder: number
    questions?: Array<{
      id: string
      questionText: string
      answerType: string
      questionOrder: number
      options?: Array<{
        id: string
        optionText: string
        optionValue: string
        optionOrder: number
      }>
    }>
  }>
}

export default function Forms() {
  const { token } = useAuth()
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireTemplate[]>([])
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!token) return
      setLoading(true)
      setError(null)

      try {
        const templatesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/templates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!templatesRes.ok) {
          throw new Error('Failed to load templates')
        }

        const templatesData = await templatesRes.json()

        setQuestionnaires([])
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

  const handleEditQuestionnaire = (id: string) => {
    setSelectedQuestionnaire(id)
    setShowEditor(true)
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
              questionnaireId={selectedQuestionnaire}
              onBack={() => setShowEditor(false)}
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
function QuestionnaireEditor({ questionnaireId, onBack }: { questionnaireId: string | null, onBack: () => void }) {
  // Mock questionnaire steps data
  const [steps, setSteps] = useState([
    {
      id: "step1",
      title: "Personal Information",
      description: "Basic demographic and contact information",
      questions: 4,
      order: 1
    },
    {
      id: "step2",
      title: "Medical History",
      description: "Previous medical conditions and treatments",
      questions: 6,
      order: 2
    },
    {
      id: "step3",
      title: "Current Medications",
      description: "Current prescription and over-the-counter medications",
      questions: 3,
      order: 3
    },
    {
      id: "step4",
      title: "Weight Loss Goals",
      description: "Target weight and timeline preferences",
      questions: 5,
      order: 4
    }
  ])

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    // Logic to reorder steps
    console.log(`Moving step ${stepId} ${direction}`)
  }

  const editStep = (stepId: string) => {
    console.log(`Editing step ${stepId}`)
  }

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-4">
            ← Back to Forms
          </Button>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Weight Loss Assessment - Editor</h2>
          <p className="text-muted-foreground">Drag and drop to reorder steps, click to edit questions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Step Blocks */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Questionnaire Steps</CardTitle>
          <p className="text-sm text-muted-foreground">Click on a step to edit questions, use arrows to reorder</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps
              .sort((a, b) => a.order - b.order)
              .map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-4 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => editStep(step.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{step.order}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{step.questions} questions</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        moveStep(step.id, 'up')
                      }}
                      disabled={index === 0}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        editStep(step.id)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

            {/* Add New Step */}
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
              <div className="text-center">
                <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Add New Step</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}