import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Save, Plus, Trash2, GripVertical, MessageSquare, Info, Edit, X, Code2, ChevronDown, ChevronUp, RefreshCw, GitBranch, Eye, StopCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { QuestionEditor } from "../QuestionEditor"

interface Step {
  id: string
  title: string
  description: string
  stepOrder: number
  category: "normal" | "info" | "user_profile"
  stepType: "question" | "info"
  isDeadEnd?: boolean
  conditionalLogic?: string | null
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
  options?: Array<{optionText: string, optionValue: string, riskLevel?: 'safe' | 'review' | 'reject' | null}>
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
  const [conditionalModalType, setConditionalModalType] = useState<'question' | 'step'>('question')
  const [editingConditionalStepId, setEditingConditionalStepId] = useState<string | null>(null)
  const [hoveredConditionalStepId, setHoveredConditionalStepId] = useState<string | null>(null)
  const [selectedQuestionForConditional, setSelectedQuestionForConditional] = useState<{
    stepId: string
    questionId: string
    questionText: string
    options: Array<{optionText: string, optionValue: string}>
    isEditingExisting?: boolean
    existingConditionalQuestionId?: string
  } | null>(null)
  const [editingConditionalStep, setEditingConditionalStep] = useState<{
    id?: string
    text: string
    helpText: string
    placeholder: string
    stepType: 'single' | 'yesno' | 'multi' | 'textarea' | 'info' | 'deadend' | null
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
          isDeadEnd: Boolean(s.isDeadEnd),
          conditionalLogic: s.conditionalLogic || null,
          questions: (s.questions || []).map((q: any) => ({
            id: String(q.id),
            type: q.answerType || 'single-choice', // Use actual answerType from backend
            answerType: q.answerType || 'radio', // Add answerType field
            questionSubtype: q.questionSubtype || null, // Add questionSubtype for yes/no detection
            questionText: String(q.questionText || ''),
            required: Boolean(q.isRequired),
            placeholder: q.placeholder || null,
            helpText: q.helpText || null,
            options: (q.options || []).map((o: any) => ({
            optionText: String(o.optionText || ''),
            optionValue: String(o.optionValue || o.optionText || ''),
            riskLevel: o.riskLevel || null
          })),
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

  const handleAddStep = async (stepType: "question" | "info" | "yesno" | "multi" | "textarea" | "deadend") => {
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
      } else if (stepType === 'deadend' && newStepId) {
        // Dead End - Informational step (no question) that terminates form
        // Don't create a question - dead end is just title + description like info step
        // Mark the step as dead end and set default title/description
        await fetch(`${baseUrl}/questionnaires/step`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: newStepId,
            title: 'Disqualification Notice',
            description: 'Unfortunately, you do not qualify at this time. Thank you for your interest.',
            isDeadEnd: true
          }),
        })
      } else if (stepType === 'info' && newStepId) {
        // Information - Just title + description, no question
        // Set default title for info steps
        await fetch(`${baseUrl}/questionnaires/step`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: newStepId,
            title: 'Information',
            description: 'Important information for you to review.'
          }),
        })
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
          options: (q.options || []).map((o: any) => ({
            optionText: String(o.optionText || ''),
            optionValue: String(o.optionValue || o.optionText || ''),
            riskLevel: o.riskLevel || null
          })),
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
        isDeadEnd: Boolean(s.isDeadEnd),
        questions: (s.questions || []).map((q: any) => ({
          id: String(q.id),
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
          options: (q.options || []).map((o: any) => ({
            optionText: String(o.optionText || ''),
            optionValue: String(o.optionValue || o.optionText || ''),
            riskLevel: o.riskLevel || null
          })),
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
          const newOptionText = `Option ${(q.options?.length || 0) + 1}`
          return {
            ...q,
            options: [...(q.options || []), {
              optionText: newOptionText,
              optionValue: newOptionText.toLowerCase().replace(/ /g, '_')
            }]
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
          newOptions[optionIndex] = {
            optionText: newValue,
            optionValue: newValue.toLowerCase().replace(/ /g, '_')
          }
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

  // Helper: Extract question IDs from conditional logic
  const getReferencedQuestionIds = (conditionalLogic: string): string[] => {
    if (!conditionalLogic) return []
    const questionIds: string[] = []
    const tokens = conditionalLogic.split(' ')
    
    for (const token of tokens) {
      if (token.startsWith('answer_equals:')) {
        // Format: answer_equals:{questionId}:{optionValue}
        const parts = token.replace('answer_equals:', '').split(':')
        if (parts.length === 2) {
          questionIds.push(parts[0])
        }
      }
    }
    
    return Array.from(new Set(questionIds)) // Remove duplicates
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
        triggerOption: parentQuestion.options?.[0]?.optionValue || '',
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
    // Check if the step itself is a dead end step
    const containingStep = template?.steps?.find((s: any) => s.id === stepId)
    const isStepDeadEnd = containingStep?.isDeadEnd
    
    const stepType = isStepDeadEnd && conditionalQuestion.answerType === 'textarea' ? 'deadend' :
                     conditionalQuestion.answerType === 'textarea' && !conditionalQuestion.placeholder?.includes('informational') ? 'textarea' :
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
        optionText: opt.optionText,
        optionValue: opt.optionValue
      })),
      rules: parsedRules.length > 0 ? parsedRules : [{
        questionId: parentQuestionId,
        questionText: parentQuestion.questionText,
        questionNumber: currentStepIdx + 1,
        triggerOption: parentQuestion.options?.[0]?.optionValue || '',
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

  // Open modal to add step-level conditional logic
  const handleOpenStepConditionalModal = (stepId: string) => {
    console.log('Opening step conditional modal for step:', stepId)
    const currentStepIndex = steps.findIndex(s => s.id === stepId)
    const currentStep = steps[currentStepIndex]
    
    console.log('Current step index:', currentStepIndex, 'Current step:', currentStep)
    
    if (!currentStep) {
      console.error('Current step not found')
      return
    }
    
    // Get all questions from previous steps that have options
    const allPrevQuestions = steps
      .slice(0, currentStepIndex)
      .flatMap((s, stepIdx) => 
        (s.questions || [])
          .filter(q => (q.conditionalLevel || 0) === 0 && q.options && q.options.length > 0)
          .map(q => ({
            ...q,
            questionNumber: stepIdx + 1
          }))
      )
    
    console.log('All previous questions with options:', allPrevQuestions)
    
    if (allPrevQuestions.length === 0) {
      alert('No previous questions with options available for rules. Add questions to earlier steps first.')
      return
    }
    
    // Parse existing conditional logic if any
    let parsedRules: Array<{
      questionId: string
      questionText: string
      questionNumber: number
      triggerOption: string
      operator: 'OR' | 'AND'
    }> = []
    
    console.log('Current step conditionalLogic:', currentStep.conditionalLogic)
    
    if (currentStep.conditionalLogic) {
      const tokens = currentStep.conditionalLogic.split(' ')
      console.log('Parsing tokens:', tokens)
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if (token.startsWith('answer_equals:')) {
          const [questionRef, optionValue] = token.replace('answer_equals:', '').split(':')
          console.log('Found rule:', { questionRef, optionValue })
          
          const referencedQuestion = allPrevQuestions.find(q => q.id === questionRef)
          console.log('Referenced question found:', referencedQuestion)
          
          if (referencedQuestion) {
            const nextToken = tokens[i + 1]
            const operator = (nextToken === 'OR' || nextToken === 'AND') ? nextToken : 'OR'
            parsedRules.push({
              questionId: referencedQuestion.id,
              questionText: referencedQuestion.questionText,
              questionNumber: referencedQuestion.questionNumber,
              triggerOption: optionValue,
              operator
            })
          }
        }
      }
      
      console.log('Parsed rules:', parsedRules)
    }
    
    // Initialize rules or use existing
    const initialRules = parsedRules.length > 0 ? parsedRules : [{
      questionId: allPrevQuestions[0].id,
      questionText: allPrevQuestions[0].questionText,
      questionNumber: allPrevQuestions[0].questionNumber,
      triggerOption: allPrevQuestions[0].options?.[0]?.optionValue || '',
      operator: 'OR' as 'OR' | 'AND'
    }]
    
    console.log('Setting state...', {
      editingConditionalStepId: stepId,
      conditionalModalType: 'step',
      rules: initialRules
    })
    
    setEditingConditionalStepId(stepId)
    setConditionalModalType('step')
    setEditingConditionalStep({
      text: currentStep.title,
      helpText: '',
      placeholder: '',
      stepType: null,
      placement: 'new-step',
      options: [],
      rules: initialRules
    })
    setShowConditionalModal(true)
    
    console.log('Modal should be opening now')
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
        isDeadEnd: Boolean(s.isDeadEnd),
        questions: (s.questions || []).map((q: any) => ({
          id: String(q.id),
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
          options: (q.options || []).map((o: any) => ({
            optionText: String(o.optionText || ''),
            optionValue: String(o.optionValue || o.optionText || ''),
            riskLevel: o.riskLevel || null
          })),
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
    if (!token || !templateId) return
    
    if (editingConditionalStep.rules.length === 0) {
      alert('Please add at least one rule')
      return
    }

    try {
      // Build the conditionalLogic string from rules
      const logicParts = editingConditionalStep.rules.map((rule, index) => {
        const condition = `answer_equals:${rule.questionId}:${rule.triggerOption}`
        if (index === editingConditionalStep.rules.length - 1) {
          return condition
        }
        return `${condition} ${rule.operator}`
      })
      const conditionalLogic = logicParts.join(' ')

      // Handle STEP-LEVEL conditional logic
      if (conditionalModalType === 'step' && editingConditionalStepId) {
        console.log('Saving step-level conditional logic:', {
          stepId: editingConditionalStepId,
          conditionalLogic,
          rules: editingConditionalStep.rules
        })
        
        const updateRes = await fetch(`${baseUrl}/questionnaires/step`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            stepId: editingConditionalStepId,
            conditionalLogic
          }),
        })
        
        if (!updateRes.ok) {
          const errorData = await updateRes.json().catch(() => ({}))
          console.error('Failed to save step conditional logic:', errorData)
          throw new Error(errorData.message || 'Failed to save step rules')
        }
        
        console.log('Step conditional logic saved successfully')
        
        // Reload template
        const refRes = await fetch(`${baseUrl}/questionnaires/templates/${templateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const refData = await refRes.json()
        console.log('Reloaded template data:', refData.data)
        console.log('Steps in reloaded data:', refData.data?.steps)
        const editedStep = refData.data?.steps?.find((s: any) => s.id === editingConditionalStepId)
        console.log('Step we just edited (FULL):', JSON.stringify(editedStep, null, 2))
        console.log('conditionalLogic value:', editedStep?.conditionalLogic)
        setTemplate(refData.data)
        const loadedSteps = (refData.data?.steps || []).map((s: any) => {
          console.log(`Loading step ${s.id}:`, { title: s.title, conditionalLogic: s.conditionalLogic })
          return {
          id: String(s.id),
          title: String(s.title || ''),
          description: String(s.description || ''),
          stepOrder: Number(s.stepOrder || 0),
          category: (s.category === 'info' ? 'info' : s.category === 'user_profile' ? 'user_profile' : 'normal') as 'normal' | 'info' | 'user_profile',
          stepType: (s.questions && s.questions.length > 0) ? 'question' : 'info',
          isDeadEnd: Boolean(s.isDeadEnd),
          conditionalLogic: s.conditionalLogic || null,
          questions: (s.questions || []).map((q: any) => ({
            id: String(q.id),
            type: q.answerType || 'single-choice',
            answerType: q.answerType || 'radio',
            questionSubtype: q.questionSubtype || null,
            questionText: String(q.questionText || ''),
            required: Boolean(q.isRequired),
            placeholder: q.placeholder || null,
            helpText: q.helpText || null,
            options: (q.options || []).map((o: any) => ({
              optionText: String(o.optionText || ''),
              optionValue: String(o.optionValue || o.optionText || ''),
              riskLevel: o.riskLevel || null
            })),
            conditionalLevel: Number(q.conditionalLevel || 0),
            subQuestionOrder: Number(q.subQuestionOrder || 0)
          })),
        }
        }) as Step[]
        console.log('Loaded steps with conditionalLogic:', loadedSteps.map(s => ({ id: s.id, title: s.title, conditionalLogic: s.conditionalLogic })))
        setSteps(loadedSteps)
        
        // Close modal
        setShowConditionalModal(false)
        setEditingConditionalStepId(null)
        setConditionalModalType('question')
        return
      }

      // Handle QUESTION-LEVEL conditional logic (existing code)
      if (!selectedQuestionForConditional) return
      if (!editingConditionalStep.stepType) {
        alert('Please select a step type')
        return
      }
      if (!editingConditionalStep.text.trim()) {
        alert('Please enter text for this step')
        return
      }

      // Validate: all rules must reference the same parent question (for now)
      const parentQuestionId = selectedQuestionForConditional.questionId
      const allSameParent = editingConditionalStep.rules.every(r => r.questionId === parentQuestionId)
      
      if (!allSameParent) {
        alert('Currently, all rules for a conditional step must reference the same parent question. Cross-question logic coming soon!')
        return
      }

      // Re-build conditionalLogic for question-level (simpler format)
      const questionLogicParts = editingConditionalStep.rules.map((rule, index) => {
        const condition = `answer_equals:${rule.triggerOption}`
        if (index === editingConditionalStep.rules.length - 1) {
          return condition
        }
        return `${condition} ${rule.operator}`
      })
      const questionConditionalLogic = questionLogicParts.join(' ')

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
                conditionalLogic: questionConditionalLogic,
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
                conditionalLogic: questionConditionalLogic,
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
            conditionalLogic: questionConditionalLogic,
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
          conditionalLogic: questionConditionalLogic,
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
          case 'deadend':
            // Dead End is information-only (no question), just update step
            // Skip question creation entirely
            break
          case 'info':
            // Info is also information-only (no question)
            // Skip question creation entirely
            break
        }

        // Only create a question if stepType is NOT info or deadend
        if (editingConditionalStep.stepType !== 'info' && editingConditionalStep.stepType !== 'deadend') {
          const res = await fetch(`${baseUrl}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          })

          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create conditional step')
        }
        
        // Update step title and description for info/deadend types
        if ((editingConditionalStep.stepType === 'info' || editingConditionalStep.stepType === 'deadend') && targetStepId) {
          await fetch(`${baseUrl}/questionnaires/step`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              stepId: targetStepId,
              title: editingConditionalStep.text.substring(0, 100) || (editingConditionalStep.stepType === 'deadend' ? 'Disqualification Notice' : 'Information'),
              description: editingConditionalStep.helpText || editingConditionalStep.text,
              isDeadEnd: editingConditionalStep.stepType === 'deadend'
            }),
          }).catch(() => { }) // Non-critical, continue if fails
        }
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
        isDeadEnd: Boolean(s.isDeadEnd),
        questions: (s.questions || []).map((q: any) => ({
          id: String(q.id),
          type: q.answerType || 'single-choice',
          answerType: q.answerType || 'radio',
          questionSubtype: q.questionSubtype || null,
          questionText: String(q.questionText || ''),
          required: Boolean(q.isRequired),
          placeholder: q.placeholder || null,
          helpText: q.helpText || null,
          options: (q.options || []).map((o: any) => ({
            optionText: String(o.optionText || ''),
            optionValue: String(o.optionValue || o.optionText || ''),
            riskLevel: o.riskLevel || null
          })),
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Add Step Controls */}
            <div className="lg:col-span-1 space-y-6">
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

                  <Button 
                    onClick={() => handleAddStep("deadend")} 
                    className="w-full justify-start text-left h-auto py-4 px-5 rounded-xl border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-all"
                    variant="outline"
                    disabled={isAccountTemplate}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <StopCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-base mb-0.5">Dead End</div>
                        <div className="text-xs text-muted-foreground">Terminates form automatically</div>
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
                            options: (q.options || []).map((o: any) => ({
            optionText: String(o.optionText || ''),
            optionValue: String(o.optionValue || o.optionText || ''),
            riskLevel: o.riskLevel || null
          })),
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
            <div className="lg:col-span-3 space-y-6 relative">
              {/* Questions Section Header */}
              <div>
                <h2 className="text-2xl font-semibold tracking-tight mb-3">Questions</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  These are the intake form questions. Some questions will be automatically added to every form when needed.
                </p>
              </div>

              {steps.length > 0 ? (
                <div className="space-y-5 relative">
                  {/* Visual connection lines for conditional steps */}
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                    {steps.map((step, index) => {
                      if (!step.conditionalLogic) return null
                      
                      const referencedQuestionIds = getReferencedQuestionIds(step.conditionalLogic)
                      const referencedStepIndices: number[] = []
                      
                      steps.forEach((s, idx) => {
                        if (s.questions?.some(q => referencedQuestionIds.includes(q.id))) {
                          referencedStepIndices.push(idx)
                        }
                      })
                      
                      return referencedStepIndices.map(refIdx => {
                        if (refIdx >= index) return null // Only draw to previous steps
                        
                        // Calculate vertical positions (approximate)
                        const startY = refIdx * 280 + 140 // Approximate center of referenced step
                        const endY = index * 280 + 140 // Approximate center of conditional step
                        
                        return (
                          <div key={`${step.id}-${refIdx}`} className="absolute right-0 w-8" style={{ top: startY, height: endY - startY }}>
                            {/* Orange vertical line */}
                            <div className="absolute right-3 top-0 w-0.5 h-full bg-orange-400/60"></div>
                            {/* Top circle */}
                            <div className="absolute right-2 top-0 w-2 h-2 rounded-full bg-orange-500"></div>
                            {/* Bottom circle */}
                            <div className="absolute right-2 bottom-0 w-2 h-2 rounded-full bg-orange-500"></div>
                            {/* Horizontal connector to start */}
                            <div className="absolute right-0 top-0 w-3 h-0.5 bg-orange-400/60"></div>
                            {/* Horizontal connector to end */}
                            <div className="absolute right-0 bottom-0 w-3 h-0.5 bg-orange-400/60"></div>
                          </div>
                        )
                      })
                    })}
                  </div>
                  
                  {steps.map((step, index) => {
                    // Check if this step or any question in it is referenced by the hovered conditional step
                    const referencedQuestionIds = hoveredConditionalStepId && steps.find(s => s.id === hoveredConditionalStepId)?.conditionalLogic
                      ? getReferencedQuestionIds(steps.find(s => s.id === hoveredConditionalStepId)!.conditionalLogic!)
                      : []
                    const isReferencedByHovered = step.questions?.some(q => referencedQuestionIds.includes(q.id))
                    
                    return (
                    <div
                      key={step.id}
                      className={`
                        bg-card rounded-2xl shadow-sm overflow-hidden transition-all relative
                        ${step.isDeadEnd ? "border-2 border-red-300 bg-red-50/30 dark:bg-red-900/10" : "border border-border/40"}
                        ${editingStepId === step.id ? "ring-2 ring-teal-500/50 shadow-md" : ""}
                        ${draggedStepId === step.id ? "opacity-50" : ""}
                        ${isReferencedByHovered ? "ring-2 ring-orange-400 bg-orange-50/20" : ""}
                        ${step.conditionalLogic ? "hover:shadow-lg cursor-pointer" : ""}
                      `}
                      style={{ zIndex: 1 }}
                      draggable
                      onDragStart={() => handleDragStart(step.id)}
                      onDragOver={(e) => handleDragOver(e, step.id)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => step.conditionalLogic && setHoveredConditionalStepId(step.id)}
                      onMouseLeave={() => setHoveredConditionalStepId(null)}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-5">
                          {/* Icon based on question type */}
                          {(() => {
                            const firstQuestion = step.questions?.[0]
                            const isDeadEnd = step.isDeadEnd
                            const isInfo = step.stepType === "info"
                            const isYesNo = firstQuestion?.questionSubtype === 'yesno'
                            const isMulti = firstQuestion?.answerType === 'checkbox'
                            const isTextarea = firstQuestion?.answerType === 'textarea'
                            
                            let bgColor = "bg-teal-50 dark:bg-teal-900/20"
                            let iconColor = "text-teal-600 dark:text-teal-400"
                            let icon = <MessageSquare className="h-7 w-7" />
                            
                            if (isDeadEnd) {
                              bgColor = "bg-red-50 dark:bg-red-900/20"
                              iconColor = "text-red-600 dark:text-red-400"
                              icon = <StopCircle className="h-7 w-7" />
                            } else if (isInfo) {
                              bgColor = "bg-gray-100 dark:bg-gray-800"
                              iconColor = "text-gray-600 dark:text-gray-400"
                              icon = <Info className="h-7 w-7" />
                            } else if (isYesNo) {
                              bgColor = "bg-blue-50 dark:bg-blue-900/20"
                              iconColor = "text-blue-600 dark:text-blue-400"
                            } else if (isMulti) {
                              bgColor = "bg-purple-50 dark:bg-purple-900/20"
                              iconColor = "text-purple-600 dark:text-purple-400"
                            } else if (isTextarea) {
                              bgColor = "bg-orange-50 dark:bg-orange-900/20"
                              iconColor = "text-orange-600 dark:text-orange-400"
                              icon = <Edit className="h-7 w-7" />
                            }
                            
                            return (
                              <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${bgColor}`}>
                                <div className={iconColor}>
                                  {icon}
                                </div>
                              </div>
                            )
                          })()}
                          
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
                              {step.isDeadEnd && (
                                <Badge variant="destructive" className="text-xs rounded-full px-3 py-1 bg-red-500 text-white border-red-600">
                                  <StopCircle className="h-3 w-3 mr-1" />
                                  DEAD END
                                </Badge>
                              )}
                              {step.conditionalLogic && (
                                <div className="flex items-center gap-1 text-[10px] text-orange-600 font-medium">
                                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                  Conditional
                                </div>
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
                                      <div className={`rounded-lg border p-5 transition-all ${
                                        referencedQuestionIds.includes(q.id)
                                          ? 'bg-orange-50 border-orange-400 shadow-md ring-2 ring-orange-300'
                                          : 'bg-card border-border/40 hover:shadow-md'
                                      }`}>
                                        {referencedQuestionIds.includes(q.id) && (
                                          <div className="mb-3 pb-3 border-b border-orange-300">
                                            <div className="flex items-center gap-2 text-xs font-medium text-orange-700">
                                              <GitBranch className="h-3.5 w-3.5" />
                                              <span>Referenced by: {steps.find(s => s.id === hoveredConditionalStepId)?.title}</span>
                                            </div>
                                          </div>
                                        )}
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
                                                <span className="flex-1">{opt.optionText}</span>
                                                {opt.riskLevel && (
                                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    opt.riskLevel === 'safe' ? 'bg-green-100 text-green-700 border border-green-300' :
                                                    opt.riskLevel === 'review' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                                    'bg-red-100 text-red-700 border border-red-300'
                                                  }`}>
                                                    {opt.riskLevel === 'safe' ? '✓ SAFE' : opt.riskLevel === 'review' ? '⚠ REVIEW' : '✕ REJECT'}
                                                  </span>
                                                )}
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
                                <div className="bg-card rounded-lg border border-border/40 p-5">
                                  {editingStepId === step.id ? (
                                    // Edit mode
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Step Title</label>
                                        <input
                                          type="text"
                                          value={step.title}
                                          onChange={(e) => {
                                            const newSteps = steps.map(s => s.id === step.id ? {...s, title: e.target.value} : s)
                                            setSteps(newSteps)
                                          }}
                                          className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                                          placeholder="Enter step title"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground">Description</label>
                                        <textarea
                                          value={step.description}
                                          onChange={(e) => {
                                            const newSteps = steps.map(s => s.id === step.id ? {...s, description: e.target.value} : s)
                                            setSteps(newSteps)
                                          }}
                                          className="w-full px-3 py-2 border rounded-md bg-background text-sm resize-none"
                                          rows={3}
                                          placeholder="Enter description or information text"
                                        />
                                      </div>
                                      <div className="flex gap-2 justify-end pt-2 border-t">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingStepId(null)}
                                        >
                                          Done
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    // View mode
                                    <>
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <p className="font-medium text-base mb-1">{step.title || 'Information Step'}</p>
                                          <p className="text-sm text-muted-foreground">{step.description || 'No description provided'}</p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setEditingStepId(step.id)}
                                          className="flex-shrink-0 rounded-lg"
                                        >
                                          <Edit className="h-4 w-4 mr-1.5" />
                                          Edit
                                        </Button>
                                      </div>
                                      {step.isDeadEnd && (
                                        <div className="mt-3 pt-3 border-t">
                                          <p className="text-xs text-red-600 font-medium">
                                            ⚠ This step will terminate the form
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  )}
                              </div>
                            )}
                          </div>
                          
                          {/* Action Icons */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenStepConditionalModal(step.id)}
                              className="h-8 text-xs px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title={step.conditionalLogic ? "Edit conditional logic" : "Create conditional rule"}
                            >
                              <GitBranch className="h-3.5 w-3.5 mr-1" />
                              {step.conditionalLogic ? 'Edit Rule' : 'Create Rule'}
                            </Button>
                            <div className="flex items-start gap-2">
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
                    </div>
                    )
                  })}
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
      {showConditionalModal && (selectedQuestionForConditional || conditionalModalType === 'step') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {conditionalModalType === 'step' ? 'Step Conditional Logic' : 'Conditional Logic Builder'}
                  </CardTitle>
                  <CardDescription>
                    {conditionalModalType === 'step' 
                      ? 'Define when this step should appear based on previous answers.'
                      : 'Create rules and add multiple conditional steps that will appear when the rules match.'}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowConditionalModal(false)
                    setConditionalModalType('question')
                    setEditingConditionalStepId(null)
                    setSelectedQuestionForConditional(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Parent Question Display - Only for question-level conditionals */}
              {conditionalModalType === 'question' && selectedQuestionForConditional && (
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Parent Question:</p>
                  <p className="font-medium">{selectedQuestionForConditional.questionText}</p>
                </div>
              )}

              {/* Step-level conditional info */}
              {conditionalModalType === 'step' && editingConditionalStepId && (
                <div className="flex items-start justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Step-Level Conditional Logic</p>
                    <p className="text-xs text-muted-foreground">This entire step will only show if the rules match.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm('Delete all rules for this step? The step will always show.')) return
                      if (!token || !editingConditionalStepId) return
                      
                      try {
                        const deleteRes = await fetch(`${baseUrl}/questionnaires/step`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({
                            stepId: editingConditionalStepId,
                            conditionalLogic: '' // Send empty string instead of null
                          }),
                        })
                        
                        if (!deleteRes.ok) {
                          const errorData = await deleteRes.json().catch(() => ({}))
                          console.error('Delete rules failed:', errorData)
                          throw new Error(errorData.message || 'Failed to delete rules')
                        }
                        
                        // Reload and close
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
                          isDeadEnd: Boolean(s.isDeadEnd),
                          conditionalLogic: s.conditionalLogic || null,
                          questions: (s.questions || []).map((q: any) => ({
                            id: String(q.id),
                            type: q.answerType || 'single-choice',
                            answerType: q.answerType || 'radio',
                            questionSubtype: q.questionSubtype || null,
                            questionText: String(q.questionText || ''),
                            required: Boolean(q.isRequired),
                            placeholder: q.placeholder || null,
                            helpText: q.helpText || null,
                            options: (q.options || []).map((o: any) => ({
                              optionText: String(o.optionText || ''),
                              optionValue: String(o.optionValue || o.optionText || ''),
                              riskLevel: o.riskLevel || null
                            })),
                            conditionalLevel: Number(q.conditionalLevel || 0),
                            subQuestionOrder: Number(q.subQuestionOrder || 0)
                          })),
                        })) as Step[]
                        setSteps(loadedSteps)
                        setShowConditionalModal(false)
                        setEditingConditionalStepId(null)
                        setConditionalModalType('question')
                      } catch (error) {
                        console.error('Failed to delete rules:', error)
                        alert('Failed to delete rules')
                      }
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete All Rules
                  </Button>
                </div>
              )}

              {/* Conditional Step Editor */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  {conditionalModalType === 'step' ? 'Configure Step Rules' : 
                   editingConditionalStep.id ? 'Edit Conditional Step' : 'Create New Conditional Step'}
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
                        const targetStepId = conditionalModalType === 'step' ? editingConditionalStepId : selectedQuestionForConditional?.stepId
                        const currentStepIndex = steps.findIndex(s => s.id === targetStepId)
                        const allPrevQuestions = steps
                          .slice(0, conditionalModalType === 'step' ? currentStepIndex : currentStepIndex + 1)
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
                              triggerOption: defaultQ.options?.[0]?.optionValue || '',
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
                    const targetStepId = conditionalModalType === 'step' ? editingConditionalStepId : selectedQuestionForConditional?.stepId
                    const currentStepIndex = steps.findIndex(s => s.id === targetStepId)
                    const allPrevQuestions = steps
                      .slice(0, conditionalModalType === 'step' ? currentStepIndex : currentStepIndex + 1)
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
                                    triggerOption: selected.options?.[0]?.optionValue || ''
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
                                console.log('Dropdown changed:', e.target.value, 'for rule', index)
                                console.log('Available options:', selectedQ?.options)
                                const newRules = [...editingConditionalStep.rules]
                                newRules[index] = { ...rule, triggerOption: e.target.value }
                                setEditingConditionalStep({...editingConditionalStep, rules: newRules})
                                console.log('Updated rules:', newRules)
                              }}
                              className="w-full px-2 py-1.5 border rounded-md bg-background text-xs"
                            >
                              {(selectedQ?.options || []).map((option, optIdx) => {
                                console.log(`Option ${optIdx}:`, option.optionText, '=', option.optionValue)
                                return (
                                  <option key={`rule-${index}-opt-${optIdx}-${option.optionValue}`} value={option.optionValue}>
                                    {option.optionText}
                                  </option>
                                )
                              })}
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

                {/* Step 2: Where to show the conditional step - Only for question-level */}
                {conditionalModalType === 'question' && (
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
                )}

                {/* Step 3: Choose Step Type - Only for question-level */}
                {conditionalModalType === 'question' && (
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
                        className="h-auto py-2.5 flex flex-col items-center gap-1"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'info',
                          text: 'Important information to note',
                          placeholder: 'No response needed - informational only'
                        })}
                      >
                        <Info className="h-4 w-4 text-gray-600" />
                        <div className="text-[10px] font-medium">Information</div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-2.5 flex flex-col items-center gap-1 border-red-200 hover:border-red-300 hover:bg-red-50"
                        onClick={() => setEditingConditionalStep({
                          ...editingConditionalStep, 
                          stepType: 'deadend',
                          text: 'Unfortunately, you do not qualify at this time.',
                          placeholder: 'No response needed - form will end here'
                        })}
                      >
                        <StopCircle className="h-4 w-4 text-red-600" />
                        <div className="text-[10px] font-medium">Dead End</div>
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
                          {editingConditionalStep.stepType === 'deadend' && <StopCircle className="h-4 w-4 text-red-600" />}
                          <span className="font-medium text-xs">
                            {editingConditionalStep.stepType === 'single' ? 'Single Option' :
                             editingConditionalStep.stepType === 'yesno' ? 'Yes/No' :
                             editingConditionalStep.stepType === 'multi' ? 'Multi Option' :
                             editingConditionalStep.stepType === 'textarea' ? 'Multi Line Text' :
                             editingConditionalStep.stepType === 'deadend' ? 'Dead End' :
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
                )}

                {/* Step 4: Configure the conditional step - Only for question-level */}
                {conditionalModalType === 'question' && editingConditionalStep.stepType && (
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-foreground">4. Configure this step</label>
                    
                    {/* Show a temporary question editor for the conditional step */}
                    <div className="bg-background rounded-lg border p-4">
                      <div className="space-y-4">
                        {/* Title/Question Text */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-foreground">
                            {editingConditionalStep.stepType === 'info' || editingConditionalStep.stepType === 'deadend' ? 'Step Title' : 'Question Text'} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                            value={editingConditionalStep.text}
                            onChange={(e) => setEditingConditionalStep({...editingConditionalStep, text: e.target.value})}
                            placeholder={
                              editingConditionalStep.stepType === 'textarea' ? "e.g., Please describe your symptoms in detail" :
                              editingConditionalStep.stepType === 'info' ? "e.g., Important Notice" :
                              editingConditionalStep.stepType === 'deadend' ? "e.g., Disqualification Notice" :
                              "e.g., What other medication are you taking?"
                            }
                            className="w-full px-3 py-2 border rounded-md bg-background text-sm h-9"
                  />
                </div>

                        {/* Description (for info/deadend) or Help Text (for questions) */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-medium text-muted-foreground">
                            {editingConditionalStep.stepType === 'info' || editingConditionalStep.stepType === 'deadend' ? 'Description' : 'Help Text'} <span className="text-xs">(optional)</span>
                          </label>
                          <textarea
                            value={editingConditionalStep.helpText}
                            onChange={(e) => setEditingConditionalStep({...editingConditionalStep, helpText: e.target.value})}
                            placeholder={
                              editingConditionalStep.stepType === 'info' ? "Information for patients to review..." :
                              editingConditionalStep.stepType === 'deadend' ? "Explain why they don't qualify..." :
                              "Add context or instructions..."
                            }
                            className="w-full px-2.5 py-2 text-xs border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            rows={3}
                          />
                    </div>
                        
                        {/* Placeholder - Only for textarea type (not info or deadend) */}
                        {editingConditionalStep.stepType === 'textarea' && (
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
                        {editingConditionalStep.stepType && editingConditionalStep.stepType !== 'textarea' && editingConditionalStep.stepType !== 'info' && editingConditionalStep.stepType !== 'deadend' && (
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
                <Button variant="outline" onClick={() => {
                  setShowConditionalModal(false)
                  setConditionalModalType('question')
                  setEditingConditionalStepId(null)
                  setSelectedQuestionForConditional(null)
                }}>
                  Close
                </Button>
                <Button 
                  onClick={handleSaveConditionalStep}
                  disabled={
                    conditionalModalType === 'step' 
                      ? editingConditionalStep.rules.length === 0
                      : (!editingConditionalStep.stepType || !editingConditionalStep.text.trim() || editingConditionalStep.rules.length === 0)
                  }
                >
                      <Save className="mr-2 h-4 w-4" />
                  {conditionalModalType === 'step' ? 'Save Rules' : 
                   editingConditionalStep.id ? 'Update Step' : 'Create Step'}
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
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getQuestionTypeLabel()}
                    </Badge>
                  </div>
                  <CardDescription>
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
                  options: (editingQuestion.options || []).map((opt, idx) => ({ 
                    id: undefined as any, 
                    optionText: opt.optionText, 
                    optionValue: opt.optionValue, 
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
                      options: (updated.options || []).map((o: any) => ({
                        optionText: o.optionText,
                        optionValue: o.optionValue || o.optionText
                      })),
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
