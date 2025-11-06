import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    Workflow,
    Plus,
    Search,
    Mail,
    MessageSquare,
    Clock,
    Play,
    Pause,
    Edit,
    Trash2,
    ChevronRight,
    ArrowLeft,
    Settings,
    Users,
    TrendingUp,
    Calendar,
    Filter,
    ChevronDown,
    ChevronUp,
    Smartphone
} from 'lucide-react'

interface SequenceStep {
    id: string
    name: string
    triggerType: 'event' | 'time' | 'manual'
    delay: number // in hours
    delayUnit: 'hours' | 'days'
    channel: 'email' | 'sms'
    templateId: string
    templateName?: string
    templateSubject?: string // For email
    templateBody?: string // Preview of message content
    conditionalLogic?: {
        field: string
        operator: string
        value: string
    }
}

interface Sequence {
    id: string
    name: string
    description?: string
    status: 'active' | 'paused' | 'draft'
    triggerEvent: string
    steps: SequenceStep[]
    stats: {
        totalSent: number
        openRate?: number
        clickRate?: number
        activeContacts: number
    }
    createdAt: string
    updatedAt: string
}

// Mock data para desarrollo
const MOCK_SEQUENCES: Sequence[] = [
    {
        id: '1',
        name: 'Post-Checkout Onboarding',
        description: 'Automated welcome sequence for new patients after checkout',
        status: 'active',
        triggerEvent: 'checkout_completed',
        steps: [
            {
                id: 's1',
                name: 'Welcome SMS',
                triggerType: 'event',
                delay: 0,
                delayUnit: 'hours',
                channel: 'sms',
                templateId: 't1',
                templateName: 'Welcome Message',
                templateBody: 'Thanks for your order, {{first_name}}! Your protocol is being prepared. Reply STOP to unsubscribe.'
            },
            {
                id: 's2',
                name: 'Preparation Email',
                triggerType: 'time',
                delay: 2,
                delayUnit: 'days',
                channel: 'email',
                templateId: 't2',
                templateName: 'Treatment Preparation Guide',
                templateSubject: 'Prepare for Your Treatment',
                templateBody: 'Hi {{first_name}},\n\nHere\'s how to prepare before your treatment starts:\n\n1. Review medication guidelines\n2. Complete pre-treatment checklist\n3. Schedule your first follow-up\n\nQuestions? Reply to this email anytime.'
            },
            {
                id: 's3',
                name: 'Follow-up Booking',
                triggerType: 'time',
                delay: 5,
                delayUnit: 'days',
                channel: 'email',
                templateId: 't3',
                templateName: 'Schedule Follow-up',
                templateSubject: 'Ready for your follow-up?',
                templateBody: 'Hi {{first_name}},\n\nHow are you feeling after starting treatment? It\'s time to schedule your follow-up consultation.\n\n[Schedule Teleconsult Button]\n\nLooking forward to checking in with you!'
            }
        ],
        stats: {
            totalSent: 456,
            openRate: 68.5,
            clickRate: 24.3,
            activeContacts: 89
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '2',
        name: 'HRT Protocol Adherence',
        description: 'Medication reminders and progress checks for HRT patients',
        status: 'active',
        triggerEvent: 'protocol_start',
        steps: [
            {
                id: 's4',
                name: 'Welcome to Protocol',
                triggerType: 'event',
                delay: 0,
                delayUnit: 'hours',
                channel: 'email',
                templateId: 't4',
                templateName: 'HRT Welcome',
                templateSubject: 'Welcome to Your HRT Protocol',
                templateBody: 'Hi {{first_name}},\n\nWelcome to your new hormone therapy plan! This email contains important information about your protocol:\n\n• Starting dosage: {{dosage}}\n• Administration instructions\n• What to expect in the first 30 days\n• Monitoring guidelines\n\nYour health journey starts now!'
            },
            {
                id: 's5',
                name: 'Week 1 Reminder',
                triggerType: 'time',
                delay: 7,
                delayUnit: 'days',
                channel: 'sms',
                templateId: 't5',
                templateName: 'Dosage Reminder',
                templateBody: 'Hi {{first_name}}! Don\'t forget your dosage today. Stay consistent for best results. Reply HELP for support or STOP to opt out.'
            },
            {
                id: 's6',
                name: '30-Day Check-in',
                triggerType: 'time',
                delay: 30,
                delayUnit: 'days',
                channel: 'email',
                templateId: 't6',
                templateName: 'Progress Review',
                templateSubject: 'Time to Check Your Progress',
                templateBody: 'Hi {{first_name}},\n\nCongratulations on completing 30 days on your protocol!\n\nIt\'s time to:\n✓ Review your progress\n✓ Discuss any side effects\n✓ Consider renewing your prescription\n\n[Schedule Consultation] [Order Refill]\n\nWe\'re here to support you!'
            }
        ],
        stats: {
            totalSent: 234,
            openRate: 72.1,
            clickRate: 31.5,
            activeContacts: 67
        },
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '3',
        name: 'Prescription Renewal Reminder',
        description: 'Automated reminders for prescription renewals',
        status: 'paused',
        triggerEvent: 'prescription_expiring',
        steps: [
            {
                id: 's7',
                name: '7-Day Warning',
                triggerType: 'time',
                delay: 7,
                delayUnit: 'days',
                channel: 'email',
                templateId: 't7',
                templateName: 'Renewal Reminder',
                templateSubject: 'Your Prescription Expires in 7 Days',
                templateBody: 'Hi {{first_name}},\n\nYour prescription for {{treatment_name}} expires on {{expiry_date}}.\n\nRenew now to avoid any interruption in your treatment:\n[Renew Prescription Button]\n\nNeed to schedule a consultation first? [Book Appointment]'
            },
            {
                id: 's8',
                name: '3-Day Urgent',
                triggerType: 'time',
                delay: 3,
                delayUnit: 'days',
                channel: 'sms',
                templateId: 't8',
                templateName: 'Urgent Renewal',
                templateBody: '⚠️ URGENT: {{first_name}}, your prescription expires in 3 days! Renew now: {{renewal_link}} Reply STOP to opt out.'
            }
        ],
        stats: {
            totalSent: 128,
            openRate: 85.2,
            clickRate: 42.1,
            activeContacts: 23
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
]

export default function Flows() {
    const router = useRouter()
    const { user, token } = useAuth()
    const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES)
    const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all')
    const [loading, setLoading] = useState(false)
    const [selectedStepForPreview, setSelectedStepForPreview] = useState<string | null>(null)

    // Filter sequences
    const filteredSequences = sequences.filter(seq => {
        const matchesSearch = seq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seq.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || seq.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200'
            case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getChannelIcon = (channel: string) => {
        return channel === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
    }

    const getTriggerTypeLabel = (type: string) => {
        switch (type) {
            case 'event': return 'Event-based'
            case 'time': return 'Time-based'
            case 'manual': return 'Manual'
            default: return type
        }
    }

    // Vista de lista
    if (!selectedSequence) {
        return (
            <>
                <Head>
                    <title>Flows - Admin Portal</title>
                </Head>
                <Layout>
                    <div className="space-y-6 p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
                                    <Workflow className="h-8 w-8 text-primary" />
                                    Messaging Flows
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Automated email and SMS sequences for patient engagement
                                </p>
                            </div>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Flow
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total Flows</p>
                                            <h3 className="text-2xl font-bold mt-1">{sequences.length}</h3>
                                        </div>
                                        <Workflow className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                                            <h3 className="text-2xl font-bold mt-1">
                                                {sequences.reduce((sum, seq) => sum + seq.stats.activeContacts, 0)}
                                            </h3>
                                        </div>
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                                            <h3 className="text-2xl font-bold mt-1">
                                                {sequences.reduce((sum, seq) => sum + seq.stats.totalSent, 0)}
                                            </h3>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Avg. Open Rate</p>
                                            <h3 className="text-2xl font-bold mt-1">
                                                {(sequences.reduce((sum, seq) => sum + (seq.stats.openRate || 0), 0) / sequences.length).toFixed(1)}%
                                            </h3>
                                        </div>
                                        <Mail className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[300px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                            <input
                                                type="text"
                                                placeholder="Search flows..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('all')}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={statusFilter === 'active' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('active')}
                                        >
                                            Active
                                        </Button>
                                        <Button
                                            variant={statusFilter === 'paused' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('paused')}
                                        >
                                            Paused
                                        </Button>
                                        <Button
                                            variant={statusFilter === 'draft' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('draft')}
                                        >
                                            Draft
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sequences List */}
                        <div className="grid gap-4">
                            {filteredSequences.map((sequence) => (
                                <Card key={sequence.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSequence(sequence)}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{sequence.name}</h3>
                                                    <Badge className={`${getStatusColor(sequence.status)} border`}>
                                                        {sequence.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    {sequence.description}
                                                </p>
                                                
                                                {/* Stats */}
                                                <div className="flex gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            {sequence.stats.activeContacts} active
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            {sequence.stats.totalSent} sent
                                                        </span>
                                                    </div>
                                                    {sequence.stats.openRate && (
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">
                                                                {sequence.stats.openRate}% open rate
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Workflow className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-muted-foreground">
                                                            {sequence.steps.length} steps
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                                                    {sequence.status === 'active' ? (
                                                        <Pause className="h-4 w-4" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredSequences.length === 0 && (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No flows found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {searchTerm || statusFilter !== 'all' 
                                            ? 'Try adjusting your filters'
                                            : 'Create your first automated messaging flow'}
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Flow
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </Layout>
            </>
        )
    }

    // Vista de detalle de secuencia
    return (
        <>
            <Head>
                <title>{selectedSequence.name} - Flows</title>
            </Head>
            <Layout>
                <div className="space-y-6 p-6">
                    {/* Header con botón de volver */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => setSelectedSequence(null)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Flows
                            </Button>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-semibold">{selectedSequence.name}</h1>
                                    <Badge className={`${getStatusColor(selectedSequence.status)} border`}>
                                        {selectedSequence.status}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1">{selectedSequence.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant={selectedSequence.status === 'active' ? 'outline' : 'default'}>
                                {selectedSequence.status === 'active' ? (
                                    <>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 mr-2" />
                                        Activate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                                        <h3 className="text-2xl font-bold mt-1">{selectedSequence.stats.activeContacts}</h3>
                                    </div>
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                                        <h3 className="text-2xl font-bold mt-1">{selectedSequence.stats.totalSent}</h3>
                                    </div>
                                    <Mail className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {selectedSequence.stats.openRate?.toFixed(1) || 0}%
                                        </h3>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {selectedSequence.stats.clickRate?.toFixed(1) || 0}%
                                        </h3>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trigger Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Trigger Event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 bg-muted p-4 rounded-lg">
                                <Play className="h-5 w-5 text-primary" />
                                <span className="font-medium">{selectedSequence.triggerEvent.replace(/_/g, ' ').toUpperCase()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sequence Steps - Split Layout */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sequence Steps ({selectedSequence.steps.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Steps List */}
                                <div className="space-y-3">
                                    {selectedSequence.steps.map((step, index) => {
                                        const isSelected = selectedStepForPreview === step.id

                                        
                                        return (
                                            <div 
                                                key={step.id} 
                                                className={`relative flex gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                                                    isSelected 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-border bg-background hover:bg-muted/50'
                                                }`}
                                                onClick={() => setSelectedStepForPreview(step.id)}
                                            >
                                                {/* Step number */}
                                                <div className="flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                                        isSelected 
                                                            ? 'bg-primary text-primary-foreground' 
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                {/* Step info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm truncate">{step.name}</h4>
                                                        <Badge variant="outline" className="gap-1 flex-shrink-0">
                                                            {getChannelIcon(step.channel)}
                                                            <span className="text-xs">{step.channel.toUpperCase()}</span>
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                {step.delay === 0 
                                                                    ? 'Send immediately' 
                                                                    : `Wait ${step.delay} ${step.delayUnit}`
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Settings className="h-3 w-3" />
                                                            <span>{getTriggerTypeLabel(step.triggerType)}</span>
                                                        </div>
                                                        {step.templateName && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                <span className="truncate">{step.templateName}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {step.conditionalLogic && (
                                                        <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-2 py-1 rounded">
                                                            <Filter className="h-3 w-3" />
                                                            <span className="truncate">Has conditions</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex flex-col gap-1 flex-shrink-0">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {/* Connection line to next step */}
                                                {index < selectedSequence.steps.length - 1 && (
                                                    <div className="absolute left-8 -bottom-3 w-0.5 h-3 bg-border" />
                                                )}
                                            </div>
                                        )
                                    })}

                                    {/* Add Step Button */}
                                    <Button variant="outline" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Step
                                    </Button>
                                </div>

                                {/* Right Column - Mobile Preview */}
                                <div className="lg:sticky lg:top-6 lg:self-start">
                                    {selectedStepForPreview ? (() => {
                                        const step = selectedSequence.steps.find(s => s.id === selectedStepForPreview)
                                        if (!step) return null

                                        return (
                                            <div className="space-y-4">
                                                {/* Preview Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="h-5 w-5 text-primary" />
                                                        <h3 className="font-semibold">Message Preview</h3>
                                                    </div>
                                                    <Badge variant="outline" className="gap-1">
                                                        {getChannelIcon(step.channel)}
                                                        {step.channel.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                {/* Mobile Phone Mockup */}
                                                <div className="flex justify-center">
                                                    <div className="w-full max-w-[280px]">
                                                        <div className="relative border-[12px] border-gray-800 rounded-[2rem] shadow-2xl bg-white overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                                                            {/* Phone notch */}
                                                            <div className="absolute top-0 inset-x-0 h-5 bg-gray-800 rounded-b-3xl mx-auto w-32 z-10"></div>
                                                            
                                                            {/* Screen content */}
                                                            <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                                                                {step.channel === 'sms' ? (
                                                                    /* SMS View */
                                                                    <div className="p-3 pt-7 space-y-2">
                                                                        {/* Header */}
                                                                        <div className="flex items-center gap-2 mb-3 px-1">
                                                                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-semibold">
                                                                                HC
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[10px] font-semibold text-gray-900">Health Clinic</p>
                                                                                <p className="text-[9px] text-gray-500">SMS</p>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Message bubble */}
                                                                        <div className="flex justify-start px-1">
                                                                            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                                                                                <p className="text-[11px] text-gray-900 whitespace-pre-line leading-relaxed">
                                                                                    {step.templateBody?.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
                                                                                        const samples: Record<string, string> = {
                                                                                            'first_name': 'John',
                                                                                            'treatment_name': 'Semaglutide',
                                                                                            'expiry_date': '12/31/2024',
                                                                                            'renewal_link': 'clinic.com/renew',
                                                                                            'dosage': '2.5mg'
                                                                                        }
                                                                                        return samples[key] || key
                                                                                    })}
                                                                                </p>
                                                                                <p className="text-[9px] text-gray-500 mt-1">Just now</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Email View */
                                                                    <div className="p-3 pt-7">
                                                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                                                            {/* Email header */}
                                                                            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-semibold">
                                                                                        HC
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <p className="text-[10px] font-semibold text-gray-900">Health Clinic</p>
                                                                                        <p className="text-[9px] text-gray-500 truncate">support@healthclinic.com</p>
                                                                                    </div>
                                                                                </div>
                                                                                {step.templateSubject && (
                                                                                    <h3 className="text-[11px] font-semibold text-gray-900 mt-1 leading-tight">
                                                                                        {step.templateSubject}
                                                                                    </h3>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Email body */}
                                                                            <div className="p-3">
                                                                                <div className="text-[10px] text-gray-700 whitespace-pre-line leading-relaxed">
                                                                                    {step.templateBody?.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
                                                                                        const samples: Record<string, string> = {
                                                                                            'first_name': 'John',
                                                                                            'treatment_name': 'Semaglutide',
                                                                                            'expiry_date': '12/31/2024',
                                                                                            'renewal_link': 'clinic.com/renew',
                                                                                            'dosage': '2.5mg'
                                                                                        }
                                                                                        return samples[key] || key
                                                                                    }).replace(/\[([^\]]+)\]/g, (_, text) => {
                                                                                        return `\n━━━━━━━\n ${text}\n━━━━━━━\n`
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Step Details */}
                                                <div className="bg-muted rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-sm">Step Details</h4>
                                                    
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-muted-foreground">Template:</span>
                                                            <span className="font-medium">{step.templateName}</span>
                                                        </div>

                                                        {step.conditionalLogic && (
                                                            <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-900">
                                                                <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-400">
                                                                    <Filter className="h-3 w-3" />
                                                                    <span className="font-medium">Conditional Logic:</span>
                                                                </div>
                                                                <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                                                                    {step.conditionalLogic.field} {step.conditionalLogic.operator} {step.conditionalLogic.value}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Merge Fields */}
                                                    {step.templateBody?.match(/\{\{[^}]+\}\}/g) && (
                                                        <div className="pt-3 border-t border-border">
                                                            <p className="text-xs text-muted-foreground mb-2">Merge Fields:</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {step.templateBody.match(/\{\{[^}]+\}\}/g)?.map((field, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {field}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })() : (
                                        /* Empty state */
                                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border">
                                            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="font-semibold text-lg mb-2">Select a Step</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs">
                                                Click on any step from the list to see how the message will appear to your patients
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p className="font-medium">{new Date(selectedSequence.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Updated</p>
                                    <p className="font-medium">{new Date(selectedSequence.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Layout>
        </>
    )
}

