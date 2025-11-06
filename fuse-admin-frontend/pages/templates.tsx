import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Layout from '@/components/Layout'
import {
    Mail,
    MessageSquare,
    Plus,
    Search,
    Edit,
    Trash2,
    Copy,
    Eye,
    X,
    FileText,
    Calendar,
    User,
    Smartphone
} from 'lucide-react'

interface MessageTemplate {
    id: string
    clinicId: string
    name: string
    description?: string
    type: 'email' | 'sms'
    subject?: string
    body: string
    category?: string
    mergeFields: string[]
    isActive: boolean
    version: number
    createdBy: string
    createdAt: string
    updatedAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Templates() {
    const { user, token } = useAuth()
    const [templates, setTemplates] = useState<MessageTemplate[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [duplicating, setDuplicating] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteConfirmName, setDeleteConfirmName] = useState('')

    // Fetch templates on mount
    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`${API_URL}/message-templates`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch templates')
            }

            const data = await response.json()
            
            if (data.success) {
                setTemplates(data.data || [])
            } else {
                throw new Error(data.message || 'Failed to fetch templates')
            }
        } catch (err) {
            console.error('Error fetching templates:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleDuplicate = async (templateId: string) => {
        try {
            setDuplicating(true)

            const response = await fetch(`${API_URL}/message-templates/${templateId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to duplicate template')
            }

            const data = await response.json()

            if (data.success) {
                // Refresh templates list
                await fetchTemplates()
                // Close modal
                setShowModal(false)
                setSelectedTemplate(null)
            } else {
                throw new Error(data.message || 'Failed to duplicate template')
            }
        } catch (err) {
            console.error('Error duplicating template:', err)
            alert(err instanceof Error ? err.message : 'Failed to duplicate template')
        } finally {
            setDuplicating(false)
        }
    }

    const handleDeleteClick = () => {
        setDeleteConfirmName('')
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedTemplate) return

        try {
            setDeleting(true)

            const response = await fetch(`${API_URL}/message-templates/${selectedTemplate.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete template')
            }

            const data = await response.json()

            if (data.success) {
                // Refresh templates list
                await fetchTemplates()
                // Close modals
                setShowDeleteModal(false)
                setShowModal(false)
                setSelectedTemplate(null)
                setDeleteConfirmName('')
            } else {
                throw new Error(data.message || 'Failed to delete template')
            }
        } catch (err) {
            console.error('Error deleting template:', err)
            alert(err instanceof Error ? err.message : 'Failed to delete template')
        } finally {
            setDeleting(false)
        }
    }

    const handleDeleteCancel = () => {
        setShowDeleteModal(false)
        setDeleteConfirmName('')
    }

    // Filter templates by search and type
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = template.type === activeTab
        return matchesSearch && matchesType
    })

    const handleTemplateClick = (template: MessageTemplate) => {
        setSelectedTemplate(template)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedTemplate(null)
    }

    return (
        <>
            <Head>
                <title>Message Templates - Admin Portal</title>
            </Head>
            <Layout>
                <div className="space-y-6 p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                Message Templates
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Create and manage reusable email and SMS templates
                            </p>
                        </div>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Template
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                                        <h3 className="text-2xl font-bold mt-1">{templates.length}</h3>
                                    </div>
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email Templates</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {templates.filter(t => t.type === 'email').length}
                                        </h3>
                                    </div>
                                    <Mail className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">SMS Templates</p>
                                        <h3 className="text-2xl font-bold mt-1">
                                            {templates.filter(t => t.type === 'sms').length}
                                        </h3>
                                    </div>
                                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs with Templates */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'email' | 'sms')}>
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="email" className="gap-2">
                                <Mail className="h-4 w-4" />
                                Email Templates
                            </TabsTrigger>
                            <TabsTrigger value="sms" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                SMS Templates
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="email" className="mt-6">
                            {loading ? (
                                <Card>
                                    <CardContent className="pt-12 pb-12 text-center">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">Loading templates...</p>
                                    </CardContent>
                                </Card>
                            ) : error ? (
                                <Card>
                                    <CardContent className="pt-12 pb-12 text-center">
                                        <Mail className="h-12 w-12 text-destructive mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Error loading templates</h3>
                                        <p className="text-muted-foreground mb-6">{error}</p>
                                        <Button onClick={fetchTemplates}>
                                            Try Again
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTemplates.map((template) => (
                                    <Card 
                                        key={template.id} 
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleTemplateClick(template)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-primary" />
                                                        {template.name}
                                                    </CardTitle>
                                                    {template.description && (
                                                        <CardDescription className="mt-2">
                                                            {template.description}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                {template.version > 1 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        v{template.version}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {template.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {template.category}
                                                    </Badge>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            ) : (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No email templates found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {searchTerm ? 'Try adjusting your search' : 'Create your first email template to get started'}
                                    </p>
                                    {!searchTerm && templates.length === 0 && (
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Email Template
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="sms" className="mt-6">
                            {loading ? (
                                <Card>
                                    <CardContent className="pt-12 pb-12 text-center">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">Loading templates...</p>
                                    </CardContent>
                                </Card>
                            ) : error ? (
                                <Card>
                                    <CardContent className="pt-12 pb-12 text-center">
                                        <MessageSquare className="h-12 w-12 text-destructive mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Error loading templates</h3>
                                        <p className="text-muted-foreground mb-6">{error}</p>
                                        <Button onClick={fetchTemplates}>
                                            Try Again
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : filteredTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTemplates.map((template) => (
                                    <Card 
                                        key={template.id} 
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleTemplateClick(template)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4 text-primary" />
                                                        {template.name}
                                                    </CardTitle>
                                                    {template.description && (
                                                        <CardDescription className="mt-2">
                                                            {template.description}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                {template.version > 1 && (
                                                    <Badge variant="secondary" className="ml-2">
                                                        v{template.version}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {template.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {template.category}
                                                    </Badge>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {template.body.length} characters
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            ) : (
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No SMS templates found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {searchTerm ? 'Try adjusting your search' : 'Create your first SMS template to get started'}
                                    </p>
                                    {!searchTerm && templates.length === 0 && (
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create SMS Template
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Modal */}
                {showModal && selectedTemplate && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {selectedTemplate.type === 'email' ? (
                                            <Mail className="h-6 w-6 text-primary" />
                                        ) : (
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        )}
                                        <h2 className="text-2xl font-semibold">{selectedTemplate.name}</h2>
                                        <Badge variant="outline">
                                            {selectedTemplate.type.toUpperCase()}
                                        </Badge>
                                        {selectedTemplate.version > 1 && (
                                            <Badge variant="secondary">v{selectedTemplate.version}</Badge>
                                        )}
                                    </div>
                                    {selectedTemplate.description && (
                                        <p className="text-muted-foreground">{selectedTemplate.description}</p>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={closeModal}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Modal Body - Two Column Layout */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Template Info */}
                                    <div className="space-y-6">
                                        {/* Metadata */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Category</p>
                                                <Badge variant="outline">{selectedTemplate.category || 'Uncategorized'}</Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Status</p>
                                                <Badge variant={selectedTemplate.isActive ? 'default' : 'secondary'}>
                                                    {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Created</p>
                                                <p className="text-sm">{new Date(selectedTemplate.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                                                <p className="text-sm">{new Date(selectedTemplate.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Subject (only for emails) */}
                                        {selectedTemplate.type === 'email' && selectedTemplate.subject && (
                                            <div>
                                                <h3 className="font-semibold mb-2">Subject</h3>
                                                <div className="bg-muted p-3 rounded-lg">
                                                    <p className="text-sm">{selectedTemplate.subject}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Body */}
                                        <div>
                                            <h3 className="font-semibold mb-2">Message Body</h3>
                                            <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                                                <p className="text-sm whitespace-pre-line">{selectedTemplate.body}</p>
                                            </div>
                                            {selectedTemplate.type === 'sms' && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Character count: {selectedTemplate.body.length} / 160
                                                </p>
                                            )}
                                        </div>

                                        {/* Merge Fields */}
                                        {selectedTemplate.mergeFields.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-2">Merge Fields</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTemplate.mergeFields.map((field, idx) => (
                                                        <Badge key={idx} variant="secondary">
                                                            {'{{' + field + '}}'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    These fields will be replaced with actual patient data when messages are sent
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                                            <Button variant="default" className="gap-2">
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="gap-2"
                                                onClick={() => handleDuplicate(selectedTemplate.id)}
                                                disabled={duplicating || deleting}
                                            >
                                                <Copy className="h-4 w-4" />
                                                {duplicating ? 'Duplicating...' : 'Duplicate'}
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                className="gap-2"
                                                onClick={handleDeleteClick}
                                                disabled={duplicating || deleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Right Column - Mobile Preview */}
                                    <div className="lg:sticky lg:top-6 lg:self-start bg-muted p-4 rounded-lg">
                                        <div className="space-y-4">
                                            {/* Preview Header */}
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-5 w-5 text-primary" />
                                                <h3 className="font-semibold">Message Preview</h3>
                                            </div>

                                            {/* Mobile Phone Mockup */}
                                            <div className="flex justify-center">
                                                <div className="w-full max-w-[280px]">
                                                    <div className="relative border-[12px] border-gray-800 rounded-[2rem] shadow-2xl bg-white overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                                                        {/* Phone notch */}
                                                        <div className="absolute top-0 inset-x-0 h-5 bg-gray-800 rounded-b-3xl mx-auto w-32 z-10"></div>
                                                        
                                                        {/* Screen content */}
                                                        <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                                                            {selectedTemplate.type === 'sms' ? (
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
                                                                                {selectedTemplate.body}
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
                                                                            {selectedTemplate.subject && (
                                                                                <h3 className="text-[11px] font-semibold text-gray-900 mt-1 leading-tight">
                                                                                    {selectedTemplate.subject}
                                                                                </h3>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {/* Email body */}
                                                                        <div className="p-3">
                                                                            <div className="text-[10px] text-gray-700 whitespace-pre-line leading-relaxed">
                                                                                {selectedTemplate.body}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Preview Note */}
                                            <div className="bg-muted p-3 rounded-lg">
                                                <p className="text-xs text-muted-foreground">
                                                    <strong>Note:</strong> Merge fields (like {'{{'} first_name {'}}'}  ) will be replaced with actual patient data when messages are sent.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedTemplate && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                        <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 rounded-full bg-destructive/10">
                                    <Trash2 className="h-6 w-6 text-destructive" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold mb-2">Delete Template</h2>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        This action cannot be undone. This will permanently delete the template.
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="bg-muted p-3 rounded-lg mb-4">
                                    <p className="text-sm font-medium mb-1">Template to delete:</p>
                                    <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                                </div>

                                <label htmlFor="confirmName" className="block text-sm font-medium mb-2">
                                    Type <span className="font-semibold text-destructive">{selectedTemplate.name}</span> to confirm:
                                </label>
                                <input
                                    id="confirmName"
                                    type="text"
                                    value={deleteConfirmName}
                                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter template name"
                                    autoComplete="off"
                                    disabled={deleting}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button 
                                    variant="outline" 
                                    onClick={handleDeleteCancel}
                                    disabled={deleting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteConfirmName !== selectedTemplate.name || deleting}
                                >
                                    {deleting ? 'Deleting...' : 'Delete Template'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Layout>
        </>
    )
}

