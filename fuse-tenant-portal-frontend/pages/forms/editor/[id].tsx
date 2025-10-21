import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Save, Plus, Trash2, GripVertical, MessageSquare, Info, Edit, X, Code2, ChevronDown, ChevronUp, RefreshCw, GitBranch, Eye } from "lucide-react"
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
  answerType?: string
  questionSubtype?: string | null
  questionText: string
  required: boolean
  placeholder?: string | null
  helpText?: string | null
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
  const [formStatus, setFormStatus] = useState<'in_progress' | 'ready_for_review' | 'ready'>('in_progress')
  const isAccountTemplate = useMemo(() => template?.formTemplateType === 'user_profile', [template?.formTemplateType])
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showVariables, setShowVariables] = useState(false)
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null)
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)
  const [showConditionalModal, setShowConditionalModal] = useState(false)
  const [selectedQuestionForConditional, setSelectedQuestionForConditional] = useState<{
    stepId: string
    questionId: string
    questionText: string
    options: string[]
    isEditingExisting?: boolean
    existingConditionalQuestionId?: string
  } | null>(null)
  const [editingConditionalStep, setEditingConditionalStep] = useState<{
    id?: string
    text: string
    helpText: string
    placeholder: string
    stepType: 'single' | 'yesno' | 'multi' | 'textarea' | 'info' | null
    placement: 'inline' | 'new-step' // Where to show the conditional step
    options: Array<{optionText: string, optionValue: string}>
    rules: Array<{
      questionId: string
      questionText: string
      questionNumber: number
    triggerOption: string
      operator: 'OR' | 'AND'
    }>
  }>({
    text: '',
    helpText: '',
    placeholder: '',
    stepType: null,
    placement: 'inline',
    options: [],
    rules: []
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
        // Set form status from template data
        setFormStatus(data.data?.status || 'in_progress')
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
            type: q.answerType || 'single-choice', // Use actual answerType from backend
            answerType: q.answerType || 'radio', // Add answerType field
            questionSubtype: q.questionSubtype || null, // Add questionSubtype for yes/no detection
            questionText: String(q.questionText || ''),
            required: Boolean(q.isRequired),
            placeholder: q.placeholder || null,
            helpText: q.helpText || null,
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

  const handleAddStep = async (stepType: "question" | "info" | "yesno" | "multi" | "textarea") => {
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
        // Single Option Select
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
      } else if (stepType === 'yesno' && newStepId) {
        // Yes/No Question
        const qRes = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: newStepId,
            questionText: 'New yes/no question',
            answerType: 'radio',
            questionSubtype: 'yesno', // Mark as yes/no to prevent option editing
            isRequired: true,
            options: [
              { optionText: 'Yes', optionValue: 'yes', optionOrder: 1 },
              { optionText: 'No', optionValue: 'no', optionOrder: 2 },
            ],
          }),
        })
        if (!qRes.ok) throw new Error((await qRes.json().catch(() => ({}))).message || 'Failed to create yes/no question')
      } else if (stepType === 'multi' && newStepId) {
        // Multi Option Select
        const qRes = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: newStepId,
            questionText: 'Select all that apply',
            answerType: 'checkbox',
            isRequired: true,
            options: [
              { optionText: 'Option 1', optionValue: 'option_1', optionOrder: 1 },
              { optionText: 'Option 2', optionValue: 'option_2', optionOrder: 2 },
              { optionText: 'Option 3', optionValue: 'option_3', optionOrder: 3 },
            ],
          }),
        })
        if (!qRes.ok) throw new Error((await qRes.json().catch(() => ({}))).message || 'Failed to create multi-select question')
      } else if (stepType === 'textarea' && newStepId) {
        // Multi Line Text
        const qRes = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: newStepId,
            questionText: 'Please provide details',
            answerType: 'textarea',
            isRequired: true,
            placeholder: 'Enter your response here...',
          }),
        })
        if (!qRes.ok) throw new Error((await qRes.json().catch(() => ({}))).message || 'Failed to create text question')
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
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
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

  const handleDeleteConditionalQuestion = async (stepId: string, questionId: string) => {
    if (isAccountTemplate) return
    if (!token || !templateId) return
    if (!confirm("Are you sure you want to delete this conditional question?")) return
    
    try {
      const res = await fetch(`${baseUrl}/questions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionId }),
      })
      
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to delete conditional question')
      
      // Reload template to reflect deletion
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
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
          options: (q.options || []).map((o: any) => String(o.optionText || '')),
          conditionalLevel: Number(q.conditionalLevel || 0),
          subQuestionOrder: Number(q.subQuestionOrder || 0)
        })),
      })) as Step[]
      setSteps(loadedSteps)
      
      // Close editing if we were editing this question
      if (editingQuestionId === questionId) {
        setEditingQuestionId(null)
      }
    } catch (e: any) {
      console.error('❌ Failed to delete conditional question', e)
      alert(e.message || 'Failed to delete conditional question')
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

  // Open modal to add a NEW conditional step
  const handleOpenConditionalModal = (stepId: string, questionId: string) => {
    const currentStep = steps.find(s => s.id === stepId)
    const currentQuestion = currentStep?.questions?.find(q => q.id === questionId)
    
    if (!currentQuestion) {
      console.error('Question not found for conditional logic')
      return
    }

    // Get all questions from current and previous steps for rule building
    const currentStepIndex = steps.findIndex(s => s.id === stepId)
    const allPreviousQuestions = steps
      .slice(0, currentStepIndex + 1)
      .flatMap((s, stepIdx) => 
        (s.questions || [])
          .filter(q => (q.conditionalLevel || 0) === 0 && q.options && q.options.length > 0)
          .map((q, qIdx) => ({
            ...q,
            questionNumber: stepIdx + 1
          }))
      )

    setSelectedQuestionForConditional({
      stepId,
      questionId: currentQuestion.id,
      questionText: currentQuestion.questionText,
      options: currentQuestion.options || []
    })
    
    // Initialize with one rule pointing to the current (parent) question
    const parentQuestion = allPreviousQuestions.find(q => q.id === questionId)
    setEditingConditionalStep({
      id: undefined, // No ID means new step
      text: '',
      helpText: '',
      placeholder: '',
      stepType: null,
      placement: 'inline',
      options: [],
      rules: parentQuestion ? [{
        questionId: parentQuestion.id,
        questionText: parentQuestion.questionText,
        questionNumber: parentQuestion.questionNumber,
        triggerOption: parentQuestion.options?.[0] || '',
        operator: 'OR'
      }] : []
    })
    
    setShowConditionalModal(true)
  }

  // Open modal to EDIT an existing conditional step
  const handleOpenEditConditionalModal = (stepId: string, parentQuestionId: string, conditionalQuestion: Question) => {
    const currentStep = steps.find(s => s.id === stepId)
    const parentQuestion = currentStep?.questions?.find(q => q.id === parentQuestionId)
    
    if (!parentQuestion) {
      console.error('Parent question not found')
      return
    }

    setSelectedQuestionForConditional({
      stepId,
      questionId: parentQuestionId,
      questionText: parentQuestion.questionText,
      options: parentQuestion.options || []
    })

    // Get the full question data with conditionalLogic
    const fullStep = template?.steps?.find((s: any) => s.id === stepId)
    const fullQuestion = fullStep?.questions?.find((fq: any) => fq.id === conditionalQuestion.id)
    const conditionalLogic = fullQuestion?.conditionalLogic || ''
    const currentStepIdx = steps.findIndex(s => s.id === stepId)
    
    // Parse rules for this specific conditional question
    const parsedRules: Array<{
      questionId: string
      questionText: string
      questionNumber: number
      triggerOption: string
      operator: 'OR' | 'AND'
    }> = []
    
    if (conditionalLogic) {
      const tokens = conditionalLogic.split(' ')
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if (token.startsWith('answer_equals:')) {
          const currentOption = token.replace('answer_equals:', '')
          const nextToken = tokens[i + 1]
          const operator = (nextToken === 'OR' || nextToken === 'AND') ? nextToken : 'OR'
          parsedRules.push({ 
            questionId: parentQuestionId,
            questionText: parentQuestion.questionText,
            questionNumber: currentStepIdx + 1,
            triggerOption: currentOption, 
            operator 
          })
        }
      }
    }
    
    // Determine step type from answerType
    const stepType = conditionalQuestion.answerType === 'textarea' && !conditionalQuestion.placeholder?.includes('informational') ? 'textarea' :
                     conditionalQuestion.answerType === 'textarea' ? 'info' :
                     conditionalQuestion.answerType === 'checkbox' ? 'multi' :
                     conditionalQuestion.questionSubtype === 'yesno' ? 'yesno' :
                     'single'
    
    // Determine placement based on conditionalLevel
    // conditionalLevel 0 or undefined = new-step (separate slide)
    // conditionalLevel 1 = inline (same step as parent)
    const fullQuestionData = template?.steps?.find((s: any) => s.id === stepId)?.questions?.find((fq: any) => fq.id === conditionalQuestion.id)
    const currentPlacement = (fullQuestionData?.conditionalLevel || 0) > 0 ? 'inline' : 'new-step'
    
    setEditingConditionalStep({
      id: conditionalQuestion.id,
      text: conditionalQuestion.questionText,
      helpText: conditionalQuestion.helpText || '',
      placeholder: conditionalQuestion.placeholder || '',
      stepType,
      placement: currentPlacement,
      options: (conditionalQuestion.options || []).map(opt => ({
        optionText: opt,
        optionValue: opt
      })),
      rules: parsedRules.length > 0 ? parsedRules : [{
        questionId: parentQuestionId,
        questionText: parentQuestion.questionText,
        questionNumber: currentStepIdx + 1,
        triggerOption: parentQuestion.options?.[0] || '',
        operator: 'OR'
      }]
    })
    
    setShowConditionalModal(true)
  }

  const handleOpenEditModal = (stepId: string, question: Question) => {
    setEditingQuestion(question)
    setEditingStepId(stepId)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingQuestion(null)
    setEditingStepId(null)
  }

  const handleDeleteConditionalStep = async (stepId: string, conditionalQuestionId: string) => {
    if (!token || !templateId) return
    if (!confirm('Are you sure you want to delete this conditional step?')) return
    
    try {
      const res = await fetch(`${baseUrl}/questions`, {
        method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionId: conditionalQuestionId }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Delete failed:', errorData)
        throw new Error(errorData.message || 'Failed to delete conditional step')
      }
      
      // Reload template to refresh the view
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
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
          options: (q.options || []).map((o: any) => String(o.optionText || '')),
          conditionalLevel: Number(q.conditionalLevel || 0),
          subQuestionOrder: Number(q.subQuestionOrder || 0)
        })),
      })) as Step[]
      setSteps(loadedSteps)
    } catch (e: any) {
      console.error('❌ Error deleting conditional step:', e)
      alert(e.message || 'Failed to delete conditional step')
    }
  }

  const handleSaveConditionalStep = async () => {
    if (!selectedQuestionForConditional || !token || !templateId) return
    if (!editingConditionalStep.stepType) {
      alert('Please select a step type')
      return
    }
    if (!editingConditionalStep.text.trim()) {
      alert('Please enter text for this step')
      return
    }
    if (editingConditionalStep.rules.length === 0) {
      alert('Please add at least one rule')
      return
    }

    try {
      // Validate: all rules must reference the same parent question (for now)
      const parentQuestionId = selectedQuestionForConditional.questionId
      const allSameParent = editingConditionalStep.rules.every(r => r.questionId === parentQuestionId)
      
      if (!allSameParent) {
        alert('Currently, all rules for a conditional step must reference the same parent question. Cross-question logic coming soon!')
        return
      }

      // Build the conditionalLogic string from rules
      const logicParts = editingConditionalStep.rules.map((rule, index) => {
        const condition = `answer_equals:${rule.triggerOption}`
        if (index === editingConditionalStep.rules.length - 1) {
          return condition
        }
        return `${condition} ${rule.operator}`
      })
      const conditionalLogic = logicParts.join(' ')

      if (editingConditionalStep.id) {
        // UPDATE existing conditional step
        const fullQuestionData = template?.steps?.find((s: any) => 
          s.questions?.some((q: any) => q.id === editingConditionalStep.id)
        )?.questions?.find((fq: any) => fq.id === editingConditionalStep.id)
        
        const currentPlacement = (fullQuestionData?.conditionalLevel || 0) > 0 ? 'inline' : 'new-step'
        const placementChanged = currentPlacement !== editingConditionalStep.placement
        
        // If placement changed, we need to handle the migration
        if (placementChanged) {
          if (editingConditionalStep.placement === 'new-step' && currentPlacement === 'inline') {
            // Moving from inline to new step - create new step and move question
            const stepRes = await fetch(`${baseUrl}/questionnaires/step`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ questionnaireId: templateId }),
            })
            
            if (!stepRes.ok) throw new Error('Failed to create new step for placement change')
            
            const stepData = await stepRes.json()
            const newStepId = stepData?.data?.id
            
            // Update question to move to new step and change conditionalLevel
            const res = await fetch(`${baseUrl}/questions/${editingConditionalStep.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
                stepId: newStepId,
                conditionalLevel: 0,
                parentQuestionId: null,
                questionText: editingConditionalStep.text,
                conditionalLogic,
                helpText: editingConditionalStep.helpText || null,
                placeholder: editingConditionalStep.placeholder || null,
                options: editingConditionalStep.stepType !== 'textarea' && editingConditionalStep.stepType !== 'info' 
                  ? editingConditionalStep.options.map((opt, idx) => ({
                      optionText: opt.optionText,
                      optionValue: opt.optionValue,
                      optionOrder: idx + 1
                    }))
                  : undefined
              })
            })
            
            if (!res.ok) throw new Error('Failed to move question to new step')
            
          } else if (editingConditionalStep.placement === 'inline' && currentPlacement === 'new-step') {
            // Moving from new-step to inline - move question back to parent step
            const res = await fetch(`${baseUrl}/questions/${editingConditionalStep.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                stepId: selectedQuestionForConditional.stepId,
                conditionalLevel: 1,
                parentQuestionId: selectedQuestionForConditional.questionId,
                questionText: editingConditionalStep.text,
                conditionalLogic,
                helpText: editingConditionalStep.helpText || null,
                placeholder: editingConditionalStep.placeholder || null,
                options: editingConditionalStep.stepType !== 'textarea' && editingConditionalStep.stepType !== 'info' 
                  ? editingConditionalStep.options.map((opt, idx) => ({
                      optionText: opt.optionText,
                      optionValue: opt.optionValue,
                      optionOrder: idx + 1
                    }))
                  : undefined
              })
            })
            
            if (!res.ok) throw new Error('Failed to move question to inline')
            
            // TODO: Delete the now-empty step if it has no other questions
          }
      } else {
          // No placement change, just update the question
          const updatePayload: any = {
            questionText: editingConditionalStep.text,
            conditionalLogic,
            helpText: editingConditionalStep.helpText || null
          }
          
          // Add options if not textarea
          if (editingConditionalStep.stepType !== 'textarea' && editingConditionalStep.stepType !== 'info') {
            updatePayload.options = editingConditionalStep.options.map((opt, idx) => ({
              optionText: opt.optionText,
              optionValue: opt.optionValue,
              optionOrder: idx + 1
            }))
          }
          
          // Add placeholder for textarea
          if (editingConditionalStep.stepType === 'textarea' || editingConditionalStep.stepType === 'info') {
            updatePayload.placeholder = editingConditionalStep.placeholder || null
          }
          
          const res = await fetch(`${baseUrl}/questions/${editingConditionalStep.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(updatePayload)
          })

          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to update conditional step')
        }
      } else {
        // CREATE new conditional step
        let targetStepId = selectedQuestionForConditional.stepId
        
        // If placement is 'new-step', create a new step first
        if (editingConditionalStep.placement === 'new-step') {
          const stepRes = await fetch(`${baseUrl}/questionnaires/step`, {
          method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ questionnaireId: templateId }),
          })
          
          if (!stepRes.ok) throw new Error((await stepRes.json().catch(() => ({}))).message || 'Failed to create new step')
          
          const stepData = await stepRes.json()
          targetStepId = stepData?.data?.id
          
          if (!targetStepId) throw new Error('Failed to get new step ID')
          
          // Update the new step's title to be descriptive
          await fetch(`${baseUrl}/questionnaires/step`, {
            method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
              stepId: targetStepId, 
              title: editingConditionalStep.text.substring(0, 50), // Use question text as step title
              description: 'Conditional step - shows when rules match'
            }),
          }).catch(() => { }) // Non-critical, continue if fails
        }
        
        const payload: any = {
          stepId: targetStepId,
          questionText: editingConditionalStep.text,
          conditionalLogic,
          conditionalLevel: editingConditionalStep.placement === 'inline' ? 1 : 0, // 0 for new step (main question), 1 for inline
          isRequired: true,
        }
        
        // Only add parentQuestionId if placement is inline (don't send null)
        if (editingConditionalStep.placement === 'inline') {
          payload.parentQuestionId = selectedQuestionForConditional.questionId
        }
        
        // Only add helpText if it exists
        if (editingConditionalStep.helpText) {
          payload.helpText = editingConditionalStep.helpText
        }

        // Configure based on step type
        switch (editingConditionalStep.stepType) {
          case 'single':
            payload.answerType = 'radio'
            payload.options = editingConditionalStep.options.length > 0 
              ? editingConditionalStep.options.map((opt, idx) => ({
                  optionText: opt.optionText,
                  optionValue: opt.optionValue,
                }))
              : [
                  { optionText: 'Option 1', optionValue: 'option_1' },
                  { optionText: 'Option 2', optionValue: 'option_2' }
                ]
            break
          case 'yesno':
            payload.answerType = 'radio'
            payload.options = [
              { optionText: 'Yes', optionValue: 'yes' },
              { optionText: 'No', optionValue: 'no' }
            ]
            break
          case 'multi':
            payload.answerType = 'checkbox'
            payload.options = editingConditionalStep.options.length > 0 
              ? editingConditionalStep.options.map((opt, idx) => ({
                  optionText: opt.optionText,
                  optionValue: opt.optionValue,
                }))
              : [
                  { optionText: 'Option 1', optionValue: 'option_1' },
                  { optionText: 'Option 2', optionValue: 'option_2' },
                  { optionText: 'Option 3', optionValue: 'option_3' }
                ]
            break
          case 'textarea':
            payload.answerType = 'textarea'
            if (editingConditionalStep.placeholder) {
              payload.placeholder = editingConditionalStep.placeholder
            }
            break
          case 'info':
            payload.answerType = 'textarea'
            payload.isRequired = false
            if (editingConditionalStep.placeholder) {
              payload.placeholder = editingConditionalStep.placeholder
            }
            break
        }

        const res = await fetch(`${baseUrl}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        })

        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create conditional step')
      }

      // Reload template to show the new conditional questions
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
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
          options: (q.options || []).map((o: any) => String(o.optionText || '')),
          conditionalLevel: Number(q.conditionalLevel || 0),
          subQuestionOrder: Number(q.subQuestionOrder || 0)
        })),
      })) as Step[]
      setSteps(loadedSteps)

      // Reset form and close modal
      setEditingConditionalStep({
        text: '',
        helpText: '',
        placeholder: '',
        stepType: null,
        placement: 'inline',
        options: [],
        rules: []
      })
      setShowConditionalModal(false)
      setSelectedQuestionForConditional(null)
    } catch (e: any) {
      console.error('❌ Failed to save conditional step:', e)
      alert(e.message || 'Failed to save conditional step')
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
          <Button variant="ghost" size="sm" onClick={handleBack} className="mb-8 -ml-2">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-4 p-4 rounded-lg border ${
              saveMessage.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Header Section */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left: Title and Description */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-semibold mb-4 tracking-tight">Intake Form</h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {template.description || "Generate a voucher to start using this intake form for patient sign up."}
                </p>
              </div>
              
              {/* Right: Metadata and Actions */}
              <div className="lg:col-span-3 space-y-6">
                {/* Metadata Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Form Name</p>
                    <p className="font-semibold text-foreground text-base">{template.title}</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/40">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Status</p>
                    <Badge 
                      variant="secondary" 
                      className={`rounded-full px-3 py-1 ${
                        formStatus === 'in_progress' 
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                        formStatus === 'ready_for_review'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      }`}
                    >
                      {formStatus === 'in_progress' ? 'In Progress' :
                       formStatus === 'ready_for_review' ? 'Ready for Review' :
                       'Ready'}
                    </Badge>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  {formStatus === 'in_progress' && (
                    <Button 
                      onClick={async () => {
                        if (!token || !templateId) return
                        try {
                          // Update status to ready_for_review
                          const res = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ status: 'ready_for_review' })
                          })
                          
                          if (res.ok) {
                            setFormStatus('ready_for_review')
                            const updatedData = await res.json()
                            setTemplate(updatedData.data)
                            setSaveMessage("✅ Form submitted for review!")
                            setTimeout(() => setSaveMessage(null), 3000)
                          } else {
                            const errorData = await res.json().catch(() => ({}))
                            setSaveMessage(`❌ ${errorData.message || 'Failed to submit for review'}`)
                            setTimeout(() => setSaveMessage(null), 5000)
                          }
                        } catch (e: any) {
                          console.error('Failed to submit for review:', e)
                          setSaveMessage(`❌ ${e.message || 'Failed to submit for review'}`)
                          setTimeout(() => setSaveMessage(null), 5000)
                        }
                      }}
                      className="rounded-full px-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                      Submit for Review
                    </Button>
                  )}
                  
                  {formStatus !== 'in_progress' && (
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="rounded-full px-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                    {saving ? (
                      <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                        "Save Changes"
                    )}
                  </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6 border-border/60 shadow-sm hover:bg-muted/50"
                    onClick={() => {
                      if (!templateId) return
                      const patientFrontendUrl = process.env.NEXT_PUBLIC_PATIENT_FRONTEND_URL || 'http://localhost:3000'
                      const previewUrl = `${patientFrontendUrl}/preview/questionnaire/${templateId}`
                      window.open(previewUrl, '_blank')
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="rounded-full px-6 border-border/60 shadow-sm hover:bg-muted/50"
                  >
                    Add Voucher
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Add Step Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Add New Step Card */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/40">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold tracking-tight mb-2">Add New Step</h2>
                  <p className="text-sm text-muted-foreground">Choose a question type to add to your form</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleAddStep("question")} 
                    className="w-full justify-start text-left h-auto py-4 px-5 rounded-xl border-border/60 hover:border-border hover:bg-muted/50 transition-all"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-base mb-0.5">Single Option Select</div>
                        <div className="text-xs text-muted-foreground">Choose one from multiple options</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => handleAddStep("yesno")} 
                    className="w-full justify-start text-left h-auto py-4 px-5 rounded-xl border-border/60 hover:border-border hover:bg-muted/50 transition-all"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-base mb-0.5">Yes / No</div>
                        <div className="text-xs text-muted-foreground">Simple yes or no question</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => handleAddStep("multi")} 
                    className="w-full justify-start text-left h-auto py-4 px-5 rounded-xl border-border/60 hover:border-border hover:bg-muted/50 transition-all"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-base mb-0.5">Multi Option Select</div>
                        <div className="text-xs text-muted-foreground">Select multiple options</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    onClick={() => handleAddStep("textarea")} 
                    className="w-full justify-start text-left h-auto py-4 px-5 rounded-xl border-border/60 hover:border-border hover:bg-muted/50 transition-all"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                        <Edit className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-base mb-0.5">Multi Line Text</div>
                        <div className="text-xs text-muted-foreground">Free-form text response</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleAddStep("info")} 
                    className="w-full justify-start text-left h-auto py-4 px-5 rounded-xl border-border/60 hover:border-border hover:bg-muted/50 transition-all"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Info className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-base mb-0.5">Information Step</div>
                        <div className="text-xs text-muted-foreground">Display information only</div>
                      </div>
                    </div>
                  </Button>
                  
                  {isAccountTemplate && (
                    <p className="text-xs text-muted-foreground text-center mt-4 py-3 bg-muted/30 rounded-lg">
                      Account templates cannot be modified
                    </p>
                  )}
                </div>
              </div>

              {/* Save Actions Card */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/40 space-y-3">
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="w-full rounded-full py-6 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                >
                    {saving ? (
                      <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                      <Save className="mr-2 h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full rounded-full py-6 border-border/60 shadow-sm hover:bg-muted/50"
                    onClick={() => {
                      if (!templateId) return
                      const patientFrontendUrl = process.env.NEXT_PUBLIC_PATIENT_FRONTEND_URL || 'http://localhost:3000'
                      const previewUrl = `${patientFrontendUrl}/preview/questionnaire/${templateId}`
                      window.open(previewUrl, '_blank')
                    }}
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Preview Form
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
                            type: q.answerType || 'single-choice',
                            answerType: q.answerType || 'radio',
                            questionSubtype: q.questionSubtype || null,
                            questionText: String(q.questionText || ''),
                            required: Boolean(q.isRequired),
                            placeholder: q.placeholder || null,
                            helpText: q.helpText || null,
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
                    className="w-full rounded-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> {rebuilding ? 'Rebuilding...' : 'Rebuild from Template'}
                </Button>
              )}
              </div>
            </div>

            {/* Right Column - Steps List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Questions Section Header */}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-3">Questions</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  These are the intake form questions. Some questions will be automatically added to every form when needed.
                </p>
              </div>

              {steps.length > 0 ? (
                <div className="space-y-5">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`
                        bg-card rounded-2xl shadow-sm border border-border/40 overflow-hidden transition-all
                        ${editingStepId === step.id ? "ring-2 ring-teal-500/50 shadow-md" : ""}
                        ${draggedStepId === step.id ? "opacity-50" : ""}
                      `}
                      draggable
                      onDragStart={() => handleDragStart(step.id)}
                      onDragOver={(e) => handleDragOver(e, step.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-5">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${
                            step.stepType === "info" 
                              ? "bg-blue-50 dark:bg-blue-900/20" 
                              : "bg-teal-50 dark:bg-teal-900/20"
                          }`}>
                            {step.stepType === "info" ? (
                              <Info className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <MessageSquare className="h-7 w-7 text-teal-600 dark:text-teal-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant="outline" className="text-xs rounded-full px-3 py-1 border-border/60">
                                Step {index + 1}
                              </Badge>
                              {step.category === 'user_profile' && (
                                <Badge variant="secondary" className="text-xs rounded-full px-3 py-1 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
                                  Auto-added
                                </Badge>
                              )}
                            </div>
                            {/* Always show collapsed view */}
                            <div className="space-y-3">
                                {step.stepType === "question" && (step.questions || []).map((q) => {
                                // Only render the conditional header once for the first conditional question
                                const isFirstConditional = (q.conditionalLevel || 0) > 0 && 
                                  step.questions?.findIndex(sq => (sq.conditionalLevel || 0) > 0) === step.questions?.findIndex(sq => sq.id === q.id)
                                  
                                  // Check if this is a conditional question
                                  const fullStep = template?.steps?.find((s: any) => s.id === step.id)
                                  const fullQuestion = fullStep?.questions?.find((fq: any) => fq.id === q.id)
                                  const hasConditionalLogic = !!fullQuestion?.conditionalLogic
                                  const isConditional = (q.conditionalLevel || 0) > 0 || hasConditionalLogic
                                    
                                    return (
                                  <div key={q.id} className="space-y-3">
                                    {/* Show conditional steps (both inline and new-step) */}
                                    {isConditional && (() => {
                                      const parentQ = step.questions?.find(pq => (pq.conditionalLevel || 0) === 0)
                                      const conditionalLogic = fullQuestion?.conditionalLogic || ''
                                      const currentStepIndex = steps.findIndex(s => s.id === step.id)
                                      const isInline = (fullQuestion?.conditionalLevel || 0) > 0

                                      return (
                                        <div className={`bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-4 ${isInline ? 'ml-6' : ''}`}>
                                          <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                                                  Conditional
                                              </Badge>
                                              <Badge variant="outline" className="text-[10px] bg-blue-100 dark:bg-blue-800 border-blue-300">
                                                {q.answerType === 'checkbox' ? 'Multi' :
                                                 q.answerType === 'textarea' ? 'Text' :
                                                 q.questionSubtype === 'yesno' ? 'Yes/No' :
                                                 'Single'}
                                              </Badge>
                                              {isInline ? (
                                                <Badge variant="secondary" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">
                                                  Same Step
                                                </Badge>
                                              ) : (
                                                <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                                                  New Step
                                                </Badge>
                                              )}
                                            </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                              if (parentQ) {
                                                    handleOpenEditConditionalModal(step.id, parentQ.id, q)
                                              }
                                            }}
                                            className="h-7 text-xs"
                                          >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Manage
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                                onClick={() => handleDeleteConditionalStep(step.id, q.id)}
                                                className="h-7 text-xs text-destructive hover:text-destructive"
                                          >
                                                <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        </div>
                                          
                                          <div className="space-y-2">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{q.questionText}</p>
                                            
                                            {/* Show rules inline */}
                                            {conditionalLogic && (
                                              <div className="bg-white/50 dark:bg-blue-900/30 rounded p-2 border border-blue-200/50">
                                                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                                  <span className="text-muted-foreground">IF:</span>
                                                  <span className="px-1.5 py-0.5 bg-blue-100/50 dark:bg-blue-800/30 rounded font-medium">
                                                    {currentStepIndex + 1}. {parentQ?.questionText?.substring(0, 20)}...
                                                  </span>
                                                  <span>is</span>
                                                  {(() => {
                                                    const tokens = conditionalLogic.split(' ')
                                                    const parts: Array<{type: 'condition' | 'operator', value: string}> = []
                                                    for (let i = 0; i < tokens.length; i++) {
                                                      const token = tokens[i]
                                                      if (token.startsWith('answer_equals:')) {
                                                        parts.push({ type: 'condition', value: token.replace('answer_equals:', '') })
                                                      } else if (token === 'OR' || token === 'AND') {
                                                        parts.push({ type: 'operator', value: token })
                                                      }
                                                    }
                                                    return parts.map((part, pidx) => (
                                                      part.type === 'condition' ? (
                                                        <span key={pidx} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded font-semibold">
                                                          {part.value}
                                                        </span>
                                                      ) : (
                                                        <span key={pidx} className={`px-1 py-0.5 rounded font-bold ${
                                                          part.value === 'OR' ? 'bg-blue-200 dark:bg-blue-700' : 'bg-purple-200 dark:bg-purple-700'
                                                        }`}>
                                                          {part.value}
                                                        </span>
                                                      )
                                                    ))
                                                  })()}
                                                </div>
                                      </div>
                                    )}
                                          </div>
                                        </div>
                                      )
                                    })()}

                                    {/* Collapsed Question View */}
                                    {(q.conditionalLevel || 0) === 0 && (
                                      <div className="bg-card rounded-lg border border-border/40 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                          <div className="flex-1">
                                            <p className="text-base font-semibold text-foreground mb-2">{q.questionText}</p>
                                            {q.helpText && (
                                              <p className="text-sm text-muted-foreground mb-3">{q.helpText}</p>
                                            )}
                                          </div>
                                      <Button
                                            variant="ghost"
                                        size="sm"
                                            onClick={() => handleOpenEditModal(step.id, q)}
                                            className="flex-shrink-0 rounded-lg"
                                          >
                                            <Edit className="h-4 w-4 mr-1.5" />
                                            Edit
                                      </Button>
                                    </div>
                                        
                                        {/* Show options for non-textarea questions */}
                                        {q.answerType !== 'textarea' && q.options && q.options.length > 0 && (
                                            <div className="space-y-2">
                                            {q.options.map((opt, i) => (
                                              <div key={i} className="flex items-center gap-3 text-sm text-foreground">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                                  q.answerType === 'checkbox' 
                                                    ? 'border-teal-500 rounded' 
                                                    : 'border-teal-500'
                                                    }`}></div>
                                                {opt}
                                                  </div>
                                            ))}
                                            </div>
                                          )}
                                        
                                        {/* Show textarea preview */}
                                        {q.answerType === 'textarea' && (
                                          <div className="bg-muted/30 rounded-lg p-4 border border-dashed border-border/60">
                                            <p className="text-sm text-muted-foreground italic">
                                              {q.placeholder || "Multi-line text area for patient response"}
                                            </p>
                                                    </div>
                                        )}
                                                      </div>
                                                    )}
                                    
                                    {/* Add Conditional Step Button - Only for main questions with options */}
                                    {(q.conditionalLevel || 0) === 0 && q.answerType !== 'textarea' && q.options && q.options.length > 0 && (
                                      <div className="mt-4">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleOpenConditionalModal(step.id, q.id)}
                                          className="w-full rounded-full border-border/60 hover:bg-muted/50 py-4"
                                        >
                                          <Plus className="mr-2 h-4 w-4" />
                                          Add Conditional Step
                                        </Button>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                              
                                {step.stepType === "info" && (
                                <div className="bg-card rounded-lg border border-border/40 p-4">
                                    <p className="font-medium text-base mb-1">{step.title}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Icons */}
                          <div className="flex items-start gap-2 flex-shrink-0">
                            {!isAccountTemplate && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-destructive/10 transition-colors"
                                onClick={() => handleDeleteStep(step.id)}
                                title="Delete step"
                              >
                                <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                            <div 
                              className="h-10 w-10 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-xl hover:bg-muted/50 transition-colors"
                              title="Drag to reorder"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl shadow-sm border border-dashed border-border/60 p-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
                      <Info className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-medium text-foreground mb-2">No steps added yet</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Use the "Add New Step" panel on the left to get started building your form.
                    </p>
                  </div>
                </div>
              )}

              {/* Help Card */}
              {template.formTemplateType === 'master_template' && (
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-2xl shadow-sm border border-purple-200/60 dark:border-purple-800/40 p-6">
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🌐</span>
                    Global Template - All Tenants
                  </h3>
                  <div className="text-sm space-y-3 text-purple-900 dark:text-purple-100">
                    <p>
                      <strong>This is a master template used by ALL tenants across the entire platform.</strong>
                    </p>
                    <p>
                      {template.category
                        ? `All ${template.category} products from every tenant will use these questions.`
                        : 'All products from every tenant will use these questions.'}
                    </p>
                    <p className="text-purple-700 dark:text-purple-300 font-medium flex items-start gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                      <span>⚠️</span>
                      <span>Changes here affect all tenants instantly. Use dynamic variables like {`{{companyName}}`} for personalization.</span>
                    </p>
                  </div>
                </div>
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
                  <CardTitle className="text-2xl mb-2">
                    Conditional Logic Builder
                  </CardTitle>
                  <CardDescription>
                    Create rules and add multiple conditional steps that will appear when the rules match.
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
              {/* Parent Question Display */}
              <div className="bg-muted/50 p-4 rounded-lg border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Parent Question:</p>
                <p className="font-medium">{selectedQuestionForConditional.questionText}</p>
              </div>

              {/* Conditional Step Editor */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  {editingConditionalStep.id ? 'Edit Conditional Step' : 'Create New Conditional Step'}
                </h3>
                
                {/* Step 1: Define Rules */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">1. When to show this step?</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Get all available questions for rule building
                        const currentStepIndex = steps.findIndex(s => s.id === selectedQuestionForConditional?.stepId)
                        const allPrevQuestions = steps
                          .slice(0, currentStepIndex + 1)
                          .flatMap((s, stepIdx) => 
                            (s.questions || [])
                              .filter(q => (q.conditionalLevel || 0) === 0 && q.options && q.options.length > 0)
                              .map(q => ({
                                ...q,
                                questionNumber: stepIdx + 1
                              }))
                          )
                        
                        const defaultQ = allPrevQuestions[0]
                        if (defaultQ) {
                          setEditingConditionalStep({
                            ...editingConditionalStep,
                            rules: [...editingConditionalStep.rules, {
                              questionId: defaultQ.id,
                              questionText: defaultQ.questionText,
                              questionNumber: defaultQ.questionNumber,
                              triggerOption: defaultQ.options?.[0] || '',
                              operator: editingConditionalStep.rules.length > 0 ? editingConditionalStep.rules[editingConditionalStep.rules.length - 1].operator : 'OR'
                            }]
                          })
                        }
                      }}
                      className="h-6 text-xs"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Rule
                    </Button>
                    </div>

                  {editingConditionalStep.rules.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2 bg-muted/30 rounded">
                      No rules yet. Click "Add Rule" to start.
                    </p>
                  )}

                  {editingConditionalStep.rules.map((rule, index) => {
                    // Get all available questions for this rule
                    const currentStepIndex = steps.findIndex(s => s.id === selectedQuestionForConditional?.stepId)
                    const allPrevQuestions = steps
                      .slice(0, currentStepIndex + 1)
                      .flatMap((s, stepIdx) => 
                        (s.questions || [])
                          .filter(q => (q.conditionalLevel || 0) === 0 && q.options && q.options.length > 0)
                          .map(q => ({
                            ...q,
                            questionNumber: stepIdx + 1
                          }))
                      )
                    
                    const selectedQ = allPrevQuestions.find(q => q.id === rule.questionId) || allPrevQuestions[0]
                    
                    return (
                      <div key={index} className="space-y-2 bg-background rounded-md p-3 border">
                        <div className="grid grid-cols-12 items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground col-span-1">{index + 1}.</span>
                          
                          {/* Question Selector - Fixed width */}
                          <div className="col-span-5">
                            <select
                              value={rule.questionId}
                              onChange={(e) => {
                                const selected = allPrevQuestions.find(q => q.id === e.target.value)
                                if (selected) {
                                  const newRules = [...editingConditionalStep.rules]
                                  newRules[index] = { 
                                    ...rule, 
                                    questionId: selected.id,
                                    questionText: selected.questionText,
                                    questionNumber: selected.questionNumber,
                                    triggerOption: selected.options?.[0] || ''
                                  }
                                  setEditingConditionalStep({...editingConditionalStep, rules: newRules})
                                }
                              }}
                              className="w-full px-2 py-1.5 border rounded-md bg-background text-xs truncate"
                              title={rule.questionText} // Show full text on hover
                            >
                              {allPrevQuestions.map((q) => (
                                <option key={q.id} value={q.id} title={q.questionText}>
                                  {q.questionNumber}. {q.questionText.length > 30 ? q.questionText.substring(0, 30) + '...' : q.questionText}
                                </option>
                              ))}
                            </select>
                  </div>

                          <span className="text-xs font-medium text-muted-foreground col-span-1 text-center">is</span>

                          {/* Answer Selector - Fixed width */}
                          <div className="col-span-4">
                    <select
                              value={rule.triggerOption}
                              onChange={(e) => {
                                const newRules = [...editingConditionalStep.rules]
                                newRules[index] = { ...rule, triggerOption: e.target.value }
                                setEditingConditionalStep({...editingConditionalStep, rules: newRules})
                              }}
                              className="w-full px-2 py-1.5 border rounded-md bg-background text-xs"
                            >
                              {(selectedQ?.options || []).map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                          {/* Delete Rule Button */}
                          <div className="col-span-1 flex justify-end">
                            {editingConditionalStep.rules.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingConditionalStep({
                                    ...editingConditionalStep,
                                    rules: editingConditionalStep.rules.filter((_, i) => i !== index)
                                  })
                                }}
                                className="text-destructive hover:text-destructive h-7 w-7 p-0"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                  </div>
                </div>

                        {index < editingConditionalStep.rules.length - 1 && (
                          <div className="flex items-center gap-2 pl-7">
                            <div className="flex gap-0.5 bg-muted rounded p-0.5">
                              <button
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                  rule.operator === 'OR' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => {
                                  const newRules = [...editingConditionalStep.rules]
                                  newRules[index] = { ...rule, operator: 'OR' }
                                  setEditingConditionalStep({...editingConditionalStep, rules: newRules})
                                }}
                              >
                                OR
                              </button>
                              <button
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                  rule.operator === 'AND' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-transparent text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => {
                                  const newRules = [...editingConditionalStep.rules]
                                  newRules[index] = { ...rule, operator: 'AND' }
                                  setEditingConditionalStep({...editingConditionalStep, rules: newRules})
                                }}
                              >
                                AND
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Step 2: Where to show the conditional step */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-foreground">2. Where to show this step?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setEditingConditionalStep({...editingConditionalStep, placement: 'inline'})}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          editingConditionalStep.placement === 'inline'
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-border hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            editingConditionalStep.placement === 'inline' ? 'bg-teal-100 dark:bg-teal-800' : 'bg-muted'
                          }`}>
                            <MessageSquare className={`h-4 w-4 ${
                              editingConditionalStep.placement === 'inline' ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">Same Step</p>
                            <p className="text-xs text-muted-foreground">Shows below current question</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setEditingConditionalStep({...editingConditionalStep, placement: 'new-step'})}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          editingConditionalStep.placement === 'new-step'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-border hover:border-border/80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            editingConditionalStep.placement === 'new-step' ? 'bg-purple-100 dark:bg-purple-800' : 'bg-muted'
                          }`}>
                            <Plus className={`h-4 w-4 ${
                              editingConditionalStep.placement === 'new-step' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold mb-1">New Step</p>
                            <p className="text-xs text-muted-foreground">Creates separate slide</p>
                          </div>
                        </div>
                      </button>
                    </div>
                </div>

                {/* Step 3: Choose Step Type */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-foreground">3. What type of step?</label>
                  
                  {!editingConditionalStep.stepType ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-auto py-2.5 flex flex-col items-center gap-1"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'single',
                          options: [
                            { optionText: 'Option 1', optionValue: 'option_1' },
                            { optionText: 'Option 2', optionValue: 'option_2' }
                          ]
                        })}
                      >
                        <MessageSquare className="h-4 w-4 text-teal-600" />
                        <div className="text-[10px] font-medium">Single Option</div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-2.5 flex flex-col items-center gap-1"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'yesno',
                          options: [
                            { optionText: 'Yes', optionValue: 'yes' },
                            { optionText: 'No', optionValue: 'no' }
                          ]
                        })}
                      >
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <div className="text-[10px] font-medium">Yes / No</div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-2.5 flex flex-col items-center gap-1"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'multi',
                          options: [
                            { optionText: 'Option 1', optionValue: 'option_1' },
                            { optionText: 'Option 2', optionValue: 'option_2' },
                            { optionText: 'Option 3', optionValue: 'option_3' }
                          ]
                        })}
                      >
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <div className="text-[10px] font-medium">Multi Option</div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-2.5 flex flex-col items-center gap-1"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'textarea',
                          placeholder: 'Enter your response here...'
                        })}
                      >
                        <Edit className="h-4 w-4 text-orange-600" />
                        <div className="text-[10px] font-medium">Multi Line Text</div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-2.5 flex flex-col items-center gap-1 col-span-2"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'info',
                          placeholder: 'No response needed - informational only'
                        })}
                      >
                        <Info className="h-4 w-4 text-gray-600" />
                        <div className="text-[10px] font-medium">Information</div>
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-background rounded-lg p-3 border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {editingConditionalStep.stepType === 'single' && <MessageSquare className="h-4 w-4 text-teal-600" />}
                          {editingConditionalStep.stepType === 'yesno' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                          {editingConditionalStep.stepType === 'multi' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                          {editingConditionalStep.stepType === 'textarea' && <Edit className="h-4 w-4 text-orange-600" />}
                          {editingConditionalStep.stepType === 'info' && <Info className="h-4 w-4 text-gray-600" />}
                          <span className="font-medium text-xs">
                            {editingConditionalStep.stepType === 'single' ? 'Single Option' :
                             editingConditionalStep.stepType === 'yesno' ? 'Yes/No' :
                             editingConditionalStep.stepType === 'multi' ? 'Multi Option' :
                             editingConditionalStep.stepType === 'textarea' ? 'Multi Line Text' :
                             'Information'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingConditionalStep({
                            ...editingConditionalStep, 
                            stepType: null,
                            options: [],
                            placeholder: ''
                          })}
                          className="h-6 text-xs"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 4: Configure the conditional step */}
                {editingConditionalStep.stepType && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">4. Configure this step</label>
                    
                    {/* Show a temporary question editor for the conditional step */}
                    <div className="bg-background rounded-lg border p-4">
                      <div className="space-y-4">
                        {/* Question Text */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-foreground">
                            {editingConditionalStep.stepType === 'info' ? 'Information Text' : 'Question Text'} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                            value={editingConditionalStep.text}
                            onChange={(e) => setEditingConditionalStep({...editingConditionalStep, text: e.target.value})}
                            placeholder={
                              editingConditionalStep.stepType === 'textarea' ? "e.g., Please describe your symptoms in detail" :
                              editingConditionalStep.stepType === 'info' ? "e.g., Important: Please consult your doctor" :
                              "e.g., What other medication are you taking?"
                            }
                            className="w-full px-3 py-2 border rounded-md bg-background text-sm h-9"
                  />
                </div>

                        {/* Help Text */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            Help Text <span className="text-xs">(optional)</span>
                          </label>
                          <textarea
                            value={editingConditionalStep.helpText}
                            onChange={(e) => setEditingConditionalStep({...editingConditionalStep, helpText: e.target.value})}
                            placeholder="Add context or instructions..."
                            className="w-full px-2.5 py-2 text-xs border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={2}
                          />
                    </div>
                        
                        {/* Placeholder for textarea types */}
                        {(editingConditionalStep.stepType === 'textarea' || editingConditionalStep.stepType === 'info') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-muted-foreground">
                              Placeholder <span className="text-xs">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={editingConditionalStep.placeholder}
                              onChange={(e) => setEditingConditionalStep({...editingConditionalStep, placeholder: e.target.value})}
                              placeholder="e.g., Enter your response..."
                              className="w-full px-3 py-2 border rounded-md bg-background text-xs h-8"
                            />
                          </div>
                        )}
                        
                        {/* Options Editor for question types */}
                        {editingConditionalStep.stepType && editingConditionalStep.stepType !== 'textarea' && editingConditionalStep.stepType !== 'info' && (
                          <div className="space-y-2 pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-foreground">
                                Options
                                {editingConditionalStep.stepType === 'yesno' && (
                                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">(Fixed)</span>
                                )}
                              </label>
                              {editingConditionalStep.stepType !== 'yesno' && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setEditingConditionalStep({
                                      ...editingConditionalStep,
                                      options: [...editingConditionalStep.options, {
                                        optionText: '',
                                        optionValue: ''
                                      }]
                                    })
                                  }}
                                  className="h-7 text-xs"
                                >
                                  + Add
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {editingConditionalStep.options.map((option, optIdx) => (
                                <div key={optIdx} className="rounded-md border border-border p-2.5 bg-muted/20">
                                  <div className="flex items-start gap-2">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary mt-1 flex-shrink-0">
                                      {optIdx + 1}
                                    </span>
                                    <div className="flex-1 space-y-2">
                                      <div className="space-y-1">
                                        <label className="block text-[10px] font-medium text-muted-foreground">
                                          Text
                                        </label>
                                        <input
                                          type="text"
                                          value={option.optionText}
                                          onChange={(e) => {
                                            const newOptions = [...editingConditionalStep.options]
                                            newOptions[optIdx] = { ...option, optionText: e.target.value }
                                            setEditingConditionalStep({...editingConditionalStep, options: newOptions})
                                          }}
                                          placeholder="e.g., Yes"
                                          className="w-full px-2 py-1.5 border rounded-md bg-background text-xs h-8"
                                          disabled={editingConditionalStep.stepType === 'yesno'}
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[10px] font-medium text-muted-foreground">
                                          Value <span className="opacity-70">(for logic)</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={option.optionValue}
                                          onChange={(e) => {
                                            const newOptions = [...editingConditionalStep.options]
                                            newOptions[optIdx] = { ...option, optionValue: e.target.value }
                                            setEditingConditionalStep({...editingConditionalStep, options: newOptions})
                                          }}
                                          placeholder="e.g., yes"
                                          className="w-full px-2 py-1.5 border rounded-md bg-background text-xs h-8"
                                          disabled={editingConditionalStep.stepType === 'yesno'}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  {editingConditionalStep.options.length > 1 && editingConditionalStep.stepType !== 'yesno' && (
                                    <div className="flex justify-end pt-1.5 mt-1.5 border-t">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setEditingConditionalStep({
                                            ...editingConditionalStep,
                                            options: editingConditionalStep.options.filter((_, i) => i !== optIdx)
                                          })
                                        }}
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
                        
                        {/* Textarea Preview */}
                        {editingConditionalStep.stepType === 'textarea' && (
                          <div className="space-y-2 pt-3 border-t">
                            <p className="text-xs font-medium text-muted-foreground">Patient View Preview:</p>
                            <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-border/60">
                              <p className="text-xs text-muted-foreground italic">
                                {editingConditionalStep.placeholder || "Large text area for detailed response..."}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowConditionalModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={handleSaveConditionalStep}
                  disabled={!editingConditionalStep.stepType || !editingConditionalStep.text.trim() || editingConditionalStep.rules.length === 0}
                >
                      <Save className="mr-2 h-4 w-4" />
                  {editingConditionalStep.id ? 'Update Step' : 'Create Step'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && editingQuestion && editingStepId && (() => {
        // Get question type label
        const getQuestionTypeLabel = () => {
          if (editingQuestion.questionSubtype === 'yesno') return 'Yes/No Question'
          if (editingQuestion.answerType === 'textarea') return 'Multi-Line Text'
          if (editingQuestion.answerType === 'checkbox') return 'Multi-Choice Question'
          if (editingQuestion.answerType === 'radio') return 'Single-Choice Question'
          if (editingQuestion.answerType === 'text') return 'Short Text'
          if (editingQuestion.answerType === 'select') return 'Select Dropdown'
          return 'Question'
        }
        
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    Edit Question
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {getQuestionTypeLabel()}
                      </Badge>
                    </div>
                    Update the question text, options, and settings.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseEditModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <QuestionEditor
                question={{
                  id: editingQuestion.id,
                  stepId: editingStepId,
                  questionText: editingQuestion.questionText,
                  answerType: editingQuestion.answerType || 'radio',
                  questionSubtype: editingQuestion.questionSubtype || null,
                  questionOrder: 1,
                  isRequired: editingQuestion.required,
                  placeholder: editingQuestion.placeholder || null,
                  helpText: editingQuestion.helpText || null,
                  options: (editingQuestion.options || []).map((text, idx) => ({ 
                    id: undefined as any, 
                    optionText: text, 
                    optionValue: text, 
                    optionOrder: idx + 1 
                  } as any)),
                } as any}
                stepCategory={template?.formTemplateType === 'user_profile' ? 'user_profile' : 'normal'}
                token={token}
                baseUrl={baseUrl}
                restrictStructuralEdits={template?.formTemplateType === 'user_profile'}
                autoEdit={true}
                onQuestionSaved={(updated) => {
                  setSteps((prev) => prev.map((s) => s.id === editingStepId ? {
                    ...s,
                    questions: (s.questions || []).map((oldQ) => oldQ.id === editingQuestion.id ? {
                      ...oldQ,
                      questionText: updated.questionText,
                      answerType: updated.answerType || oldQ.answerType,
                      placeholder: updated.placeholder || oldQ.placeholder,
                      helpText: updated.helpText || oldQ.helpText,
                      options: (updated.options || []).map((o: any) => o.optionText),
                    } : oldQ)
                  } : s))
                  handleCloseEditModal()
                }}
              />
              
              <div className="flex gap-2 justify-end pt-4 border-t mt-6">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )
      })()}
    </div>
  )
}
