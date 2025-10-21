import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Save, Plus, Trash2, GripVertical, MessageSquare, Info, Edit, X, Code2, ChevronDown, ChevronUp, RefreshCw, GitBranch } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { QuestionEditor } from "../QuestionEditor"

interface Step {
  id: string
  title: string
  description: string
  stepOrder: number
  category: "normal" | "info" | "user_profile"
  stepType: "question" | "info"
  questions?: Question[]
  conditionalQuestions?: ConditionalQuestion[]
}

interface Question {
  id: string
  type: "single-choice" | "multi-choice" | "text" | "textarea"
  questionText: string
  required: boolean
  options?: string[]
  conditionalLevel?: number
  subQuestionOrder?: number
}

interface ConditionalQuestion {
  id: string
  questionText: string
  conditionalLogic: string
  triggerOptionValue: string
  conditionalLevel: number
  subQuestionOrder: number
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
  const [rebuilding, setRebuilding] = useState(false)
  const [productCategory, setProductCategory] = useState<string | null>(null)
  const isAccountTemplate = useMemo(() => template?.formTemplateType === 'user_profile', [template?.formTemplateType])
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [showVariables, setShowVariables] = useState(false)
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null)
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)
  const [showConditionalModal, setShowConditionalModal] = useState(false)
  const [selectedQuestionForConditional, setSelectedQuestionForConditional] = useState<{
    stepId: string
    questionId: string
    questionText: string
    options: string[]
  } | null>(null)
  const [conditionalRules, setConditionalRules] = useState<Array<{
    triggerOption: string
    followUpQuestion: string
  }>>([])
  const [newConditionalRule, setNewConditionalRule] = useState<{
    triggerOption: string
    followUpQuestion: string
  }>({
    triggerOption: '',
    followUpQuestion: ''
  })

  useEffect(() => {
    if (!token) return
    if (typeof templateId !== 'string' || !templateId) return

    const fetchTemplate = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        let data = await response.json()
        // If fetching by templates endpoint failed previously, try generic questionnaire endpoint
        if (!response.ok || !data?.data) {
          const qRes = await fetch(`${baseUrl}/questionnaires/${templateId}`, { headers: { Authorization: `Bearer ${token}` } })
          const qData = await qRes.json().catch(() => ({}))
          if (!qRes.ok || !qData?.success || !qData?.data) {
            throw new Error(qData?.message || data?.message || "Failed to load template")
          }
          data = qData
        }
        setTemplate(data.data)
        // Normalize backend steps/questions/options into local editor shape
        const loadedSteps = (data.data?.steps || []).map((s: any) => ({
          id: String(s.id),
          title: String(s.title || ''),
          description: String(s.description || ''),
          stepOrder: Number(s.stepOrder || 0),
          category: (s.category === 'info' ? 'info' : s.category === 'user_profile' ? 'user_profile' : 'normal') as 'normal' | 'info' | 'user_profile',
          stepType: (s.questions && s.questions.length > 0) ? 'question' : 'info',
          questions: (s.questions || []).map((q: any) => ({
            id: String(q.id),
            type: 'single-choice',
            questionText: String(q.questionText || ''),
            required: Boolean(q.isRequired),
            options: (q.options || []).map((o: any) => String(o.optionText || '')),
            conditionalLevel: Number(q.conditionalLevel || 0),
            subQuestionOrder: Number(q.subQuestionOrder || 0)
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

  // Load product category if this questionnaire is tied to a product
  useEffect(() => {
    const loadCategory = async () => {
      try {
        if (!token || !template?.productId) {
          setProductCategory(null)
          return
        }
        const res = await fetch(`${baseUrl}/products/${template.productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data?.success && data?.data) {
          setProductCategory(data.data.category || null)
        } else {
          setProductCategory(null)
        }
      } catch {
        setProductCategory(null)
      }
    }
    loadCategory()
  }, [template?.productId, token, baseUrl])

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

  const handleOpenConditionalModal = (stepId: string, questionId: string) => {
    // Get the latest question data from state to ensure we have updated options
    const currentStep = steps.find(s => s.id === stepId)
    const currentQuestion = currentStep?.questions?.find(q => q.id === questionId)
    
    if (!currentQuestion) {
      console.error('Question not found for conditional logic')
      return
    }

    setSelectedQuestionForConditional({
      stepId,
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      options: currentQuestion.options || []
    })
    setNewConditionalRule({
      triggerOption: currentQuestion.options?.[0] || '',
      followUpQuestion: ''
    })
    setShowConditionalModal(true)
  }

  const handleAddConditionalRule = async () => {
    if (!selectedQuestionForConditional || !token || !templateId) return
    if (!newConditionalRule.triggerOption || !newConditionalRule.followUpQuestion) {
      alert('Please select a trigger option and enter a follow-up question')
      return
    }

    try {
      // Create the conditional question
      const res = await fetch(`${baseUrl}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          stepId: selectedQuestionForConditional.stepId,
          questionText: newConditionalRule.followUpQuestion,
          answerType: 'radio',
          isRequired: true,
          conditionalLogic: `answer_equals:${newConditionalRule.triggerOption}`,
          conditionalLevel: 1,
          parentQuestionId: selectedQuestionForConditional.questionId,
          options: [
            { optionText: 'Yes', optionValue: 'yes', optionOrder: 1 },
            { optionText: 'No', optionValue: 'no', optionOrder: 2 }
          ]
        })
      })

      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create conditional question')

      const createdData = await res.json()
      const newQuestionId = createdData?.data?.id

      // Reload template to show the new conditional question
      const refRes = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const refData = await refRes.json()
      setTemplate(refData.data)
      
      const loadedSteps = (refData.data?.steps || []).map((s: any) => ({
        id: String(s.id),
        title: String(s.title || ''),
        description: String(s.description || ''),
        stepOrder: Number(s.stepOrder || 0),
        category: (s.category === 'info' ? 'info' : s.category === 'user_profile' ? 'user_profile' : 'normal') as 'normal' | 'info' | 'user_profile',
        stepType: (s.questions && s.questions.length > 0) ? 'question' : 'info',
        questions: (s.questions || []).map((q: any) => ({
          id: String(q.id),
          type: 'single-choice',
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          options: (q.options || []).map((o: any) => String(o.optionText || '')),
          conditionalLevel: Number(q.conditionalLevel || 0),
          subQuestionOrder: Number(q.subQuestionOrder || 0)
        })),
      })) as Step[]
      setSteps(loadedSteps)

      // Close the parent question's edit mode and open the new conditional question
      if (newQuestionId) {
        // Keep the step open but switch to editing the new conditional question
        setEditingStepId(selectedQuestionForConditional.stepId)
        setEditingQuestionId(newQuestionId)
      } else {
        // If we don't have the new question ID, just close edit mode
        setEditingStepId(null)
        setEditingQuestionId(null)
      }

      // Reset form and close modal
      setNewConditionalRule({
        triggerOption: selectedQuestionForConditional.options[0] || '',
        followUpQuestion: ''
      })
      setShowConditionalModal(false)
      setSelectedQuestionForConditional(null)
    } catch (e: any) {
      console.error('❌ Failed to add conditional question', e)
      alert(e.message || 'Failed to add conditional question')
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
          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Header Section */}
          <div className="border-b pb-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Title and Description */}
              <div>
                <h1 className="text-3xl font-semibold mb-3">Intake Form</h1>
                <p className="text-muted-foreground text-sm">
                  {template.description || "Generate a voucher to start using this intake form for patient sign up."}
                </p>
              </div>
              
              {/* Right: Metadata Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium text-foreground">{template.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Ready
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">ID</p>
                    <p className="font-mono text-xs text-foreground break-all">{template.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Created At</p>
                    <p className="text-sm text-foreground">
                      {new Date(template.createdAt).toLocaleDateString('en-US', { 
                        month: '2-digit', 
                        day: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Manage"
                    )}
                  </Button>
                  <Button variant="outline">
                    Add Voucher
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Add Step Controls */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Step</CardTitle>
                  <CardDescription>Create a new question or info step</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleAddStep("question")} 
                    className="w-full justify-start"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question Step
                  </Button>
                  
                  <Button 
                    onClick={() => handleAddStep("info")} 
                    className="w-full justify-start"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Information Step
                  </Button>
                  
                  {isAccountTemplate && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Account templates cannot be modified
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Save Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button onClick={handleSave} disabled={saving} className="w-full">
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
                  {productCategory === 'weight_loss' && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                    if (!token || !templateId) return
                    if (!confirm('This will delete all steps in this questionnaire and rebuild from the master doctor template. Continue?')) return
                    try {
                      setRebuilding(true)
                      const res = await fetch(`${baseUrl}/questionnaires/reset-doctor-from-master`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ questionnaireId: templateId })
                      })
                      const data = await res.json().catch(() => ({}))
                      if (!res.ok || data?.success === false) {
                        throw new Error(data?.message || 'Failed to rebuild from template')
                      }
                      // Re-fetch template using the same logic as initial load (templates endpoint, fallback to generic)
                      setLoading(true)
                      let refData: any = null
                      let refOk = false
                      try {
                        const tRes = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, { headers: { Authorization: `Bearer ${token}` } })
                        const tData = await tRes.json().catch(() => ({}))
                        if (tRes.ok && tData?.data) {
                          refData = tData
                          refOk = true
                        }
                      } catch { }

                      if (!refOk) {
                        try {
                          const qRes = await fetch(`${baseUrl}/questionnaires/${templateId}`, { headers: { Authorization: `Bearer ${token}` } })
                          const qData = await qRes.json().catch(() => ({}))
                          if (qRes.ok && qData?.data) {
                            refData = qData
                            refOk = true
                          }
                        } catch { }
                      }

                      if (refOk && refData?.data) {
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
                      }
                    } catch (e: any) {
                      alert(e?.message || 'Failed to rebuild from template')
                    } finally {
                      setRebuilding(false)
                      setLoading(false)
                    }
                  }}
                  disabled={rebuilding}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> {rebuilding ? 'Rebuilding...' : 'Rebuild from Template'}
                </Button>
              )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Steps List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Questions Section Header */}
              <div>
                <h2 className="text-2xl font-semibold mb-2">Questions</h2>
                <p className="text-sm text-muted-foreground">
                  These are the intake form questions. Some questions will be automatically added to every form when needed.
                </p>
              </div>

              {steps.length > 0 ? (
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
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                            step.stepType === "info" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            {step.stepType === "info" ? (
                              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                              {step.category === 'user_profile' && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                  Auto-added
                                </Badge>
                              )}
                            </div>
                            {editingStepId === step.id ? (
                              <div className="space-y-4">
                                {/* Question Options (only for question type) */}
                                {step.stepType === "question" && (step.questions || []).map((q) => {
                                  // Only show this question in edit mode if:
                                  // 1. No specific question is being edited (editingQuestionId is null), OR
                                  // 2. This is the question being edited
                                  const shouldShowEdit = !editingQuestionId || editingQuestionId === q.id
                                  
                                  if (!shouldShowEdit) {
                                    // Show collapsed view for non-edited questions
                                    const isConditional = (q.conditionalLevel || 0) > 0
                                    
                                    return (
                                      <div key={q.id} className={`p-4 border rounded-lg ${
                                        isConditional 
                                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 ml-6' 
                                          : 'bg-muted/30'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              {isConditional && (
                                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                                                  <GitBranch className="h-3 w-3 mr-1" />
                                                  Conditional
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="font-medium text-sm mb-2">{q.questionText}</p>
                                            <div className="flex gap-2 flex-wrap">
                                              {q.options?.map((opt, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{opt}</Badge>
                                              ))}
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingQuestionId(q.id)}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  }
                                  
                                  return (
                                  <div key={q.id} className="space-y-3">
                                    <QuestionEditor
                                      question={{
                                        id: q.id,
                                        stepId: step.id,
                                        questionText: q.questionText,
                                        answerType: 'radio',
                                        questionOrder: 1,
                                        isRequired: true,
                                        options: (q.options || []).map((text, idx) => ({ id: undefined as any, optionText: text, optionValue: text, optionOrder: idx + 1 } as any)),
                                      } as any}
                                      stepCategory={template?.formTemplateType === 'user_profile' ? 'user_profile' : 'normal'}
                                      token={token}
                                      baseUrl={baseUrl}
                                      restrictStructuralEdits={template?.formTemplateType === 'user_profile'}
                                      autoEdit={true}
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
                                    
                                    {/* Add Conditional Logic Button */}
                                    {q.options && q.options.length > 0 && (
                                      <div className="mt-4 pt-4 border-t">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleOpenConditionalModal(step.id, q.id)}
                                          className="w-full"
                                        >
                                          <GitBranch className="mr-2 h-4 w-4" />
                                          Add Conditional Logic
                                        </Button>
                                      </div>
                                    )}

                                    {/* Auto-edit mode buttons */}
                                    <div className="flex gap-2 justify-end pt-3 border-t mt-4">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingStepId(null)
                                          setEditingQuestionId(null)
                                        }}
                                      >
                                        Done Editing
                                      </Button>
                                    </div>
                                  </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="relative">
                                {step.stepType === "question" && step.questions && step.questions.length > 0 && (
                                  <div className="space-y-4">
                                    {/* Main question */}
                                    {step.questions.filter(q => q.conditionalLevel === 0 || !q.conditionalLevel).map((mainQ, mainIdx) => {
                                      const hasConditionals = step.questions?.some(q => (q.conditionalLevel || 0) > 0)
                                      
                                      return (
                                        <div key={mainQ.id} className="relative">
                                          {/* Visual connection indicator */}
                                          {hasConditionals && (
                                            <div className="absolute -right-8 top-0 bottom-0 w-1 flex items-center justify-center">
                                              <div className="w-full h-full bg-gradient-to-b from-yellow-400 via-yellow-400 to-blue-400 rounded-full" />
                                              <div className="absolute top-1/2 right-0 w-3 h-3 bg-yellow-400 rounded-full" />
                                            </div>
                                          )}
                                          
                                          <p className="font-medium text-base mb-3">{mainQ.questionText}</p>
                                          {mainQ.options && mainQ.options.length > 0 && (
                                            <div className="space-y-2">
                                              {mainQ.options.map((option, i) => {
                                                const hasConditionalForThis = step.questions?.some(q => 
                                                  (q.conditionalLevel || 0) > 0 && 
                                                  q.questionText.includes('REQUIRES:' + option)
                                                )
                                                
                                                return (
                                                  <div key={i} className={`flex items-center gap-2 text-sm ${
                                                    hasConditionalForThis ? 'text-yellow-600 font-medium' : 'text-muted-foreground'
                                                  }`}>
                                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                                      hasConditionalForThis ? 'border-yellow-500 bg-yellow-100' : 'border-muted-foreground'
                                                    }`}></div>
                                                    {option}
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          )}
                                        
                                          {/* Show conditional sub-questions for this main question */}
                                          {step.questions && step.questions.filter(q => (q.conditionalLevel || 0) > 0).length > 0 && (
                                            <div className="ml-6 mt-3 pl-4 border-l-2 border-blue-300 space-y-2 relative">
                                              {/* Connection line */}
                                              <div className="absolute -left-4 top-0 w-3 h-3 bg-blue-400 rounded-full" />
                                              
                                              {step.questions
                                                .filter(q => (q.conditionalLevel || 0) > 0)
                                                .map((subQ, subIdx) => (
                                                  <div key={subQ.id} className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                                                        <GitBranch className="h-3 w-3 mr-1" />
                                                        Conditional
                                                      </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium">{subQ.questionText}</p>
                                                    {subQ.options && (
                                                      <div className="mt-2 space-y-1">
                                                        {subQ.options.map((opt, i) => (
                                                          <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <div className="w-3 h-3 rounded-full border border-muted-foreground"></div>
                                                            {opt}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                                {step.stepType === "info" && (
                                  <div>
                                    <p className="font-medium text-base mb-1">{step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Icons */}
                          <div className="flex items-start gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (editingStepId === step.id) {
                                  setEditingStepId(null)
                                  setEditingQuestionId(null)
                                } else {
                                  setEditingStepId(step.id)
                                  // Auto-select first main question (not conditional)
                                  const firstMainQuestion = step.questions?.find(q => (q.conditionalLevel || 0) === 0)
                                  setEditingQuestionId(firstMainQuestion?.id || null)
                                }
                              }}
                              title="Edit step"
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            {!isAccountTemplate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteStep(step.id)}
                                title="Delete step"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <div 
                              className="h-8 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Info className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2 text-center">No steps added yet</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Use the "Add New Step" panel on the left to get started.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Help Card */}
              {template.formTemplateType === 'master_template' && (
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
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Conditional Logic Modal */}
      {showConditionalModal && selectedQuestionForConditional && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">Question Rules</CardTitle>
                  <CardDescription>
                    Create rules for when to display this question. All rules must match in order for this questions to show up.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConditionalModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Rule Builder */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-medium text-muted-foreground">1.</span>
                  
                  {/* Parent Question Display (read-only) */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="px-3 py-2 border rounded-md bg-muted text-sm">
                      {selectedQuestionForConditional.questionText}
                    </div>
                  </div>

                  <span className="text-sm font-medium text-muted-foreground">is</span>

                  {/* Answer Option Selector */}
                  <div className="flex-1 min-w-[150px]">
                    <select
                      value={newConditionalRule.triggerOption}
                      onChange={(e) => setNewConditionalRule({...newConditionalRule, triggerOption: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      {selectedQuestionForConditional.options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Follow-up Question Input */}
                <div className="pl-12">
                  <label className="text-sm font-medium block mb-2">
                    Then show this follow-up question:
                  </label>
                  <input
                    type="text"
                    value={newConditionalRule.followUpQuestion}
                    onChange={(e) => setNewConditionalRule({...newConditionalRule, followUpQuestion: e.target.value})}
                    placeholder="e.g., Please provide more details about your condition..."
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>

                {/* Visual indicator of conditional connection */}
                {newConditionalRule.triggerOption && newConditionalRule.followUpQuestion && (
                  <div className="pl-12 text-sm bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800 dark:text-blue-300">Conditional Flow Preview:</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      When user selects "<span className="font-semibold text-blue-900 dark:text-blue-200">{newConditionalRule.triggerOption}</span>", 
                      the question "<span className="font-semibold text-blue-900 dark:text-blue-200">{newConditionalRule.followUpQuestion}</span>" will appear.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConditionalModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={handleAddConditionalRule}
                  disabled={!newConditionalRule.triggerOption || !newConditionalRule.followUpQuestion}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Conditional Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
