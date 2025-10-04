import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { StepEditor } from "./StepEditor"
import { QuestionEditor } from "./QuestionEditor"

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

interface QuestionnaireEditorProps {
    questionnaire: QuestionnaireTemplate | null
    onBack: () => void
    token: string | null
    baseUrl: string
    onQuestionSaved: (question: QuestionnaireQuestionTemplate) => void
    onStepSaved: (step: QuestionnaireStepTemplate) => void
}

export function QuestionnaireEditor({
    questionnaire,
    onBack,
    token,
    baseUrl,
    onQuestionSaved,
    onStepSaved,
}: QuestionnaireEditorProps) {
    const steps = questionnaire?.steps ?? []

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
                                .map((step) => (
                                    <div key={step.id} className="space-y-3">
                                        <StepEditor
                                            step={step}
                                            token={token}
                                            baseUrl={baseUrl}
                                            onStepSaved={onStepSaved}
                                        />

                                        {step.questions && step.questions.length > 0 && (
                                            <div className="ml-8 space-y-2 border-l-2 border-border/60 pl-4">
                                                {step.questions
                                                    .slice()
                                                    .sort((a, b) => (a.questionOrder ?? 0) - (b.questionOrder ?? 0))
                                                    .map((question) => (
                                                        <QuestionEditor
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
                                ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
