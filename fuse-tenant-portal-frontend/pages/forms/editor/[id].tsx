import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Save, Plus, Trash2, GripVertical, MessageSquare, Info, Edit, X, Code2, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { QuestionEditor } from "../QuestionEditor"

interface Step {
  id: string
  title: string
  description: string
  stepOrder: number
  category: "normal" | "info"
  stepType: "question" | "info"
  questions?: Question[]
}

interface Question {
  id: string
  type: "single-choice" | "multi-choice" | "text" | "textarea"
  questionText: string
  required: boolean
  options?: string[]
}

export default function TemplateEditor() {
  const router = useRouter()
  const { id: templateId } = router.query
  const { token } = useAuth()
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [template, setTemplate] = useState<any>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const isAccountTemplate = useMemo(() => template?.formTemplateType === 'user_profile', [template?.formTemplateType])
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [showVariables, setShowVariables] = useState(false)
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null)
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

  useEffect(() => {
    if (!templateId || !token) return

    const fetchTemplate = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.message || "Failed to load template")
        }

        const data = await response.json()
        setTemplate(data.data)
        // Normalize backend steps/questions/options into local editor shape
        const loadedSteps = (data.data?.steps || []).map((s: any) => ({
          id: String(s.id),
          title: String(s.title || ''),
          description: String(s.description || ''),
          stepOrder: Number(s.stepOrder || 0),
          category: (s.category === 'info' ? 'info' : 'normal') as 'normal' | 'info',
          stepType: (s.questions && s.questions.length > 0) ? 'question' : 'info',
          questions: (s.questions || []).map((q: any) => ({
            id: String(q.id),
            type: 'single-choice',
            questionText: String(q.questionText || ''),
            required: Boolean(q.isRequired),
            options: (q.options || []).map((o: any) => String(o.optionText || '')),
          })),
        })) as Step[]
        setSteps(loadedSteps)
      } catch (err: any) {
        console.error("❌ Error loading template:", err)
        setError(err.message || "Failed to load template")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [templateId, token, baseUrl])

  const handleBack = () => {
    router.push("/forms?tab=templates")
  }

  const handleAddStep = async (stepType: "question" | "info") => {
    if (isAccountTemplate) return
    if (!token || !templateId) return
    try {
      // Persist the currently edited step's title/description to avoid losing unsaved changes
      if (editingStepId) {
        const editing = steps.find((s) => s.id === editingStepId)
        if (editing) {
          await fetch(`${baseUrl}/questionnaires/step`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ stepId: editing.id, title: editing.title, description: editing.description }),
          }).catch(() => { })
        }
      }

      const res = await fetch(`${baseUrl}/questionnaires/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionnaireId: templateId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create step')
      const created = await res.json()
      const newStepId = created?.data?.id as string | undefined

      if (stepType === 'question' && newStepId) {
        const qRes = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: newStepId,
            questionText: 'New question',
            answerType: 'radio',
            isRequired: true,
            options: [
              { optionText: 'Option 1', optionValue: 'option_1', optionOrder: 1 },
              { optionText: 'Option 2', optionValue: 'option_2', optionOrder: 2 },
            ],
          }),
        })
        if (!qRes.ok) throw new Error((await qRes.json().catch(() => ({}))).message || 'Failed to create question')
      }

      const ref = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const refData = await ref.json()
      setTemplate(refData.data)
      const loadedSteps = (refData.data?.steps || []).map((s: any) => ({
        id: String(s.id),
        title: String(s.title || ''),
        description: String(s.description || ''),
        stepOrder: Number(s.stepOrder || 0),
        category: (s.category === 'info' ? 'info' : 'normal') as 'normal' | 'info',
        stepType: (s.questions && s.questions.length > 0) ? 'question' : 'info',
        questions: (s.questions || []).map((q: any) => ({
          id: String(q.id),
          type: 'single-choice',
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          options: (q.options || []).map((o: any) => String(o.optionText || '')),
        })),
      })) as Step[]
      setSteps(loadedSteps)
      if (newStepId) setEditingStepId(newStepId)
    } catch (e) {
      console.error('❌ Failed to add step', e)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (isAccountTemplate) return
    if (!token) return
    if (!confirm("Are you sure you want to delete this step?")) return
    try {
      const res = await fetch(`${baseUrl}/questionnaires/step`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stepId }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to delete step')
      setSteps(steps.filter(s => s.id !== stepId))
      if (editingStepId === stepId) setEditingStepId(null)
    } catch (e) {
      console.error('❌ Failed to delete step', e)
    }
  }

  const handleUpdateStep = (stepId: string, updates: Partial<Step>) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, ...updates } : s))
  }

  const handleAddOption = (stepId: string, questionId: string) => {
    setSteps(steps.map(s => {
      if (s.id !== stepId) return s
      return {
        ...s,
        questions: s.questions?.map(q => {
          if (q.id !== questionId) return q
          return {
            ...q,
            options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`]
          }
        })
      }
    }))
  }

  const handleUpdateOption = (stepId: string, questionId: string, optionIndex: number, newValue: string) => {
    setSteps(steps.map(s => {
      if (s.id !== stepId) return s
      return {
        ...s,
        questions: s.questions?.map(q => {
          if (q.id !== questionId) return q
          const newOptions = [...(q.options || [])]
          newOptions[optionIndex] = newValue
          return { ...q, options: newOptions }
        })
      }
    }))
  }

  const handleDeleteOption = (stepId: string, questionId: string, optionIndex: number) => {
    setSteps(steps.map(s => {
      if (s.id !== stepId) return s
      return {
        ...s,
        questions: s.questions?.map(q => {
          if (q.id !== questionId) return q
          return {
            ...q,
            options: q.options?.filter((_, i) => i !== optionIndex)
          }
        })
      }
    }))
  }

  const handleDragStart = (stepId: string) => {
    if (isAccountTemplate) return
    setDraggedStepId(stepId)
  }

  const handleDragOver = (e: React.DragEvent, targetStepId: string) => {
    e.preventDefault()
    if (!draggedStepId || draggedStepId === targetStepId) return

    const draggedIndex = steps.findIndex(s => s.id === draggedStepId)
    const targetIndex = steps.findIndex(s => s.id === targetStepId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newSteps = [...steps]
    const [removed] = newSteps.splice(draggedIndex, 1)
    newSteps.splice(targetIndex, 0, removed)

    // Update stepOrder for all steps
    newSteps.forEach((step, index) => {
      step.stepOrder = index + 1
    })

    setSteps(newSteps)
  }

  const handleDragEnd = async () => {
    if (isAccountTemplate) return
    const finishedDraggedId = draggedStepId
    setDraggedStepId(null)
    if (!token || !templateId) return
    try {
      await fetch(`${baseUrl}/questionnaires/step/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          questionnaireId: templateId,
          steps: steps.map((s, idx) => ({ stepId: s.id, stepOrder: idx + 1 })),
        }),
      })
    } catch (e) {
      console.error('❌ Failed to save step order', e)
    }
  }

  const handleCopyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable)
      setCopiedVariable(variable)
      setTimeout(() => setCopiedVariable(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSave = async () => {
    if (!template || saving) return

    setSaving(true)
    setSaveMessage(null)

    try {
      // Save step titles/descriptions
      await Promise.all(
        steps.map((s) =>
          fetch(`${baseUrl}/questionnaires/step`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ stepId: s.id, title: s.title, description: s.description }),
          })
        )
      )
      // Save questions/options for each step
      const questionUpdates: Promise<any>[] = []
      for (const s of steps) {
        for (const q of s.questions || []) {
          const optionsPayload = (q.options || []).map((text, idx) => ({ optionText: text, optionValue: text, optionOrder: idx + 1 }))
          questionUpdates.push(
            fetch(`${baseUrl}/questions/${q.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ questionText: q.questionText, options: optionsPayload }),
            })
          )
        }
      }
      await Promise.all(questionUpdates)

      setSaveMessage("✅ Template saved successfully!")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (err: any) {
      console.error("Error saving template:", err)
      setSaveMessage(`❌ ${err.message || "Failed to save template"}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading template...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Card className="border-destructive/40 bg-destructive/10">
              <CardHeader>
                <CardTitle>Error Loading Template</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-destructive mb-4">{error || "Template not found"}</p>
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Forms
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <Button variant="ghost" size="sm" onClick={handleBack} className="mb-3">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forms
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-foreground">{template.title}</h1>
                {template.category && (
                  <Badge variant="outline">{template.category}</Badge>
                )}
              </div>
              {template.description && (
                <p className="text-muted-foreground mt-2">{template.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className="text-sm text-muted-foreground">{saveMessage}</span>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Add Step Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Step</CardTitle>
              <CardDescription>Choose the type of step you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-dashed hover:border-primary cursor-pointer transition-colors" onClick={() => handleAddStep("question")}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Question Step</CardTitle>
                        <CardDescription className="text-xs">
                          Question with multiple choice options
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="border-2 border-dashed hover:border-primary cursor-pointer transition-colors" onClick={() => handleAddStep("info")}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Information Step</CardTitle>
                        <CardDescription className="text-xs">
                          Display information with continue button
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Steps List */}
          {steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Template Steps ({steps.length})</CardTitle>
                <CardDescription>Click on a step to edit its details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <Card
                      key={step.id}
                      className={`
                        ${editingStepId === step.id ? "ring-2 ring-primary" : ""}
                        ${draggedStepId === step.id ? "opacity-50" : ""}
                        transition-opacity
                      `}
                      draggable
                      onDragStart={() => handleDragStart(step.id)}
                      onDragOver={(e) => handleDragOver(e, step.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Step {index + 1}</Badge>
                              <Badge variant={step.stepType === "info" ? "secondary" : "default"}>
                                {step.stepType === "info" ? (
                                  <><Info className="mr-1 h-3 w-3" /> Info</>
                                ) : (
                                  <><MessageSquare className="mr-1 h-3 w-3" /> Question</>
                                )}
                              </Badge>
                            </div>
                            {editingStepId === step.id ? (
                              <div className="space-y-4">
                                {/* Title Input */}
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm font-medium">Title</label>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowVariables(!showVariables)}
                                      className="h-7 text-xs"
                                    >
                                      <Code2 className="mr-1 h-3 w-3" />
                                      Dynamic Variables
                                      {showVariables ? (
                                        <ChevronUp className="ml-1 h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="ml-1 h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                  {showVariables && (
                                    <div className="mb-2 p-2 bg-muted/50 rounded-md border text-xs space-y-1">
                                      <div className="flex items-center gap-2">
                                        <code
                                          className="bg-background px-2 py-0.5 rounded border font-mono cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors relative group"
                                          onClick={() => handleCopyVariable('{{companyName}}')}
                                          title="Click to copy"
                                        >
                                          {`{{companyName}}`}
                                          {copiedVariable === '{{companyName}}' && (
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                                              Copied!
                                            </span>
                                          )}
                                        </code>
                                        <span className="text-muted-foreground">Your company name</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <code
                                          className="bg-background px-2 py-0.5 rounded border font-mono cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors relative group"
                                          onClick={() => handleCopyVariable('{{clinicName}}')}
                                          title="Click to copy"
                                        >
                                          {`{{clinicName}}`}
                                          {copiedVariable === '{{clinicName}}' && (
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                                              Copied!
                                            </span>
                                          )}
                                        </code>
                                        <span className="text-muted-foreground">Your clinic name</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <code
                                          className="bg-background px-2 py-0.5 rounded border font-mono cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors relative group"
                                          onClick={() => handleCopyVariable('{{patientName}}')}
                                          title="Click to copy"
                                        >
                                          {`{{patientName}}`}
                                          {copiedVariable === '{{patientName}}' && (
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                                              Copied!
                                            </span>
                                          )}
                                        </code>
                                        <span className="text-muted-foreground">Patient's first name</span>
                                      </div>
                                    </div>
                                  )}
                                  <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                    placeholder="e.g., What is your main goal with {{companyName}} medication?"
                                  />
                                </div>
                                {/* Description Input */}
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description</label>
                                  <textarea
                                    value={step.description}
                                    onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
                                    placeholder="e.g., At {{companyName}}, we help patients achieve their goals."
                                  />
                                </div>
                                {/* Question Options (only for question type) */}
                                {step.stepType === "question" && (step.questions || []).map((q) => (
                                  <div key={q.id} className="mt-3">
                                    <QuestionEditor
                                      question={{
                                        id: q.id,
                                        stepId: step.id,
                                        questionText: q.questionText,
                                        answerType: 'select',
                                        questionOrder: 1,
                                        isRequired: true,
                                        options: (q.options || []).map((text, idx) => ({ id: undefined as any, optionText: text, optionValue: text, optionOrder: idx + 1 } as any)),
                                      } as any}
                                      stepCategory={template?.formTemplateType === 'user_profile' ? 'user_profile' : 'normal'}
                                      token={token}
                                      baseUrl={baseUrl}
                                      restrictStructuralEdits={template?.formTemplateType === 'user_profile'}
                                      onQuestionSaved={(updated) => {
                                        setSteps((prev) => prev.map((s) => s.id === step.id ? {
                                          ...s,
                                          questions: (s.questions || []).map((oldQ) => oldQ.id === q.id ? {
                                            ...oldQ,
                                            questionText: updated.questionText,
                                            options: (updated.options || []).map((o: any) => o.optionText),
                                          } : oldQ)
                                        } : s))
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                                {step.stepType === "question" && step.questions?.[0]?.options && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {step.questions[0].options.map((option, i) => (
                                      <Badge key={i} variant="secondary">{option}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingStepId(editingStepId === step.id ? null : step.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!isAccountTemplate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteStep(step.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {steps.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No steps added yet. Choose a step type above to get started.</p>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <CardHeader>
              <CardTitle className="text-base">🌐 Global Template - All Tenants</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>This is a master template used by ALL tenants across the entire platform.</strong>
              </p>
              <p>
                {template.category
                  ? `All ${template.category} products from every tenant will use these questions.`
                  : 'All products from every tenant will use these questions.'}
              </p>
              <p className="text-purple-700 dark:text-purple-300 font-medium">
                ⚠️ Changes here affect all tenants instantly. Use dynamic variables like {`{{companyName}}`} for personalization.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
