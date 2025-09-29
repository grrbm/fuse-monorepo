import { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Layout from '@/components/Layout'
import {
    ArrowLeft,
    Save,
    Loader2,
    Image as ImageIcon,
    Upload,
    X,
    XCircle,
    ClipboardList
} from 'lucide-react'

export default function CreateTreatment() {
    const [formData, setFormData] = useState({
        name: '',
        defaultQuestionnaire: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { token } = useAuth()
    const router = useRouter()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = (readerEvent) => {
            setLogoPreview(readerEvent.target?.result as string)
        }
        reader.readAsDataURL(file)

        setLogoFile(file)
        setError(null)
    }

    const resetLogoSelection = () => {
        setLogoFile(null)
        setLogoPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const uploadTreatmentLogo = async (treatmentId: string) => {
        if (!logoFile || !token) return false

        try {
            const form = new FormData()
            form.append('logo', logoFile)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/treatment/${treatmentId}/upload-logo`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Failed to upload treatment logo:', errorText)
                return false
            }

            const data = await response.json()

            if (!data.success) {
                console.error('❌ Failed to upload treatment logo:', data.message)
                return false
            }

            return true
        } catch (err) {
            console.error('❌ Error uploading treatment logo:', err)
            return false
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!token) {
            setError('Authentication required to create a treatment')
            return
        }

        if (!formData.name.trim()) {
            setError('Treatment name is required')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/treatments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    defaultQuestionnaire: formData.defaultQuestionnaire
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                setError(`Failed to create treatment: ${response.status} ${response.statusText}`)
                console.error('❌ Treatment creation failed:', errorText)
                return
            }

            const data = await response.json()

            if (!data.success) {
                setError(data.message || 'Failed to create treatment')
                return
            }

            const treatmentId = data?.data?.id

            if (treatmentId && logoFile) {
                const uploaded = await uploadTreatmentLogo(treatmentId)

                if (!uploaded) {
                    setError('Treatment created, but logo upload failed. You can retry from the edit page.')
                } else {
                    resetLogoSelection()
                }
            }

            router.push(`/treatments/${treatmentId}`)
        } catch (err) {
            console.error('❌ Error creating treatment:', err)
            setError('Failed to create treatment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <Head>
                <title>Create Treatment - Fuse Admin</title>
                <meta name="description" content="Create a new treatment for your clinic" />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => router.push('/treatments')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Treatments
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Create Treatment</h1>
                                <p className="text-muted-foreground">Set up a new treatment offering for your clinic</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                                    Treatment Name *
                                                </label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="e.g., Weight Loss Program"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <input
                                                    id="defaultQuestionnaire"
                                                    name="defaultQuestionnaire"
                                                    type="checkbox"
                                                    checked={formData.defaultQuestionnaire}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                                                />
                                                <label htmlFor="defaultQuestionnaire" className="text-sm text-foreground">
                                                    Create default questionnaire template for this treatment
                                                </label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Treatment Logo
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {logoPreview && (
                                                <div className="text-center">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Treatment logo preview"
                                                        className="w-full max-w-xs mx-auto h-32 object-cover rounded-lg border-2 border-primary"
                                                    />
                                                    <p className="text-sm text-primary mt-2">Logo will upload right after the treatment is created.</p>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    id="logo-upload"
                                                />
                                                <label htmlFor="logo-upload">
                                                    <Button variant="outline" className="w-full cursor-pointer" asChild>
                                                        <span>
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            {logoFile ? 'Change Logo' : 'Upload Logo'}
                                                        </span>
                                                    </Button>
                                                </label>

                                                {logoFile && (
                                                    <Button variant="outline" onClick={resetLogoSelection} className="w-full">
                                                        <X className="h-4 w-4 mr-2" />
                                                        Remove Logo
                                                    </Button>
                                                )}

                                                <p className="text-xs text-muted-foreground">Supported formats: JPEG, PNG, WebP (max 5MB)</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Instructions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <p>1. Provide the treatment name.</p>
                                            <p>2. Optionally enable the default questionnaire template.</p>
                                            <p>3. (Optional) Select a logo to upload after creation.</p>
                                            <p>4. Click "Create Treatment" to finish.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Button type="button" variant="outline" onClick={() => router.push('/treatments')} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Treatment
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    )
}


