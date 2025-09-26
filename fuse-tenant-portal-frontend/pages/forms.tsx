import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Settings
} from "lucide-react"

// Mock questionnaire data
const questionnaires = [
  {
    id: "1",
    title: "Weight Loss Assessment",
    description: "Comprehensive weight loss evaluation questionnaire",
    steps: 8,
    questions: 24,
    status: "Active",
    lastModified: "2 days ago",
    createdFrom: "Original Template"
  },
  {
    id: "2", 
    title: "Weight Loss Assessment (Custom)",
    description: "Modified version for specific clinic requirements",
    steps: 6,
    questions: 18,
    status: "Draft",
    lastModified: "1 week ago",
    createdFrom: "Weight Loss Assessment"
  }
]

export default function Forms() {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleCreateCopy = (originalId: string) => {
    // This would create a copy of the questionnaire
    console.log(`Creating copy of questionnaire ${originalId}`)
  }

  const handleEditQuestionnaire = (id: string) => {
    setSelectedQuestionnaire(id)
    setShowEditor(true)
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
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Import Template
              </Button>
              <Button onClick={() => handleCreateCopy("1")}>
                <Copy className="mr-2 h-4 w-4" />
                Create Copy
              </Button>
            </div>
          </div>

          {!showEditor ? (
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
                              <span>{questionnaire.steps} steps</span>
                              <span>{questionnaire.questions} questions</span>
                              <span>Modified {questionnaire.lastModified}</span>
                              {questionnaire.createdFrom !== "Original Template" && (
                                <span className="text-blue-600">Copy of: {questionnaire.createdFrom}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            questionnaire.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {questionnaire.status}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditQuestionnaire(questionnaire.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCreateCopy(questionnaire.id)}
                          >
                            <Copy className="h-4 w-4" />
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
                      <p className="text-xs text-muted-foreground">Active questionnaire templates</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground">Custom Forms</h3>
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-foreground">1</p>
                      <p className="text-xs text-muted-foreground">Customized versions created</p>
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
          ) : (
            /* Questionnaire Editor */
            <QuestionnaireEditor 
              questionnaireId={selectedQuestionnaire}
              onBack={() => setShowEditor(false)}
            />
          )}
        </main>
      </div>
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