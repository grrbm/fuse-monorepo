import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    ArrowLeft,
    Stethoscope,
    Eye,
    CheckCircle,
    XCircle,
    DollarSign,
    Package,
    Calendar,
    Building2,
    User,
    Image as ImageIcon
} from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    pharmacyProductId?: string
    dosage?: string
}

interface TreatmentProduct {
    id: string
    dosage: string
    product: Product
}

interface TreatmentPlan {
    id: string
    name: string
    description?: string
    price: number
    billingInterval: string
    active: boolean
    popular?: boolean
    sortOrder?: number
    stripePriceId?: string
}

interface Questionnaire {
    id: string
    title: string
    description?: string
    active: boolean
}

interface Treatment {
    id: string
    name: string
    treatmentLogo?: string
    productsPrice: number
    active: boolean
    stripeProductId?: string
    createdAt: string
    updatedAt: string
    products: Product[]
    treatmentProducts: TreatmentProduct[]
    treatmentPlans: TreatmentPlan[]
    questionnaires: Questionnaire[]
    clinic: {
        id: string
        name: string
        slug: string
        logo?: string
    }
}

export default function TreatmentDetail() {
    const [treatment, setTreatment] = useState<Treatment | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, token } = useAuth()
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        const fetchTreatment = async () => {
            if (!token || !id) return

            try {
                setLoading(true)
                console.log('🔍 Fetching treatment:', id)

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/treatments/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                console.log('🔍 Response status:', response.status)

                if (response.ok) {
                    const data = await response.json()
                    console.log('🔍 Treatment data:', data)

                    if (data.success) {
                        setTreatment(data.data)
                    } else {
                        setError(data.message || 'Failed to load treatment')
                    }
                } else {
                    const errorText = await response.text()
                    console.error('❌ Error response:', errorText)
                    setError(`Failed to load treatment: ${response.status} ${response.statusText}`)
                }

            } catch (err) {
                console.error('Error fetching treatment:', err)
                if (err instanceof Error && err.name === 'AbortError') {
                    setError('Request timed out. Please try again.')
                } else {
                    setError('Failed to load treatment')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchTreatment()
    }, [token, id])

    const getStatusBadge = (active: boolean) => {
        return active
            ? <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
            : <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
    }

    const formatPrice = (price: number) => {
        if (isNaN(price) || price === null || price === undefined) {
            return '$0.00'
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading treatment details...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !treatment) {
        return (
            <Layout>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/treatments')}
                            className="mb-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Treatments
                        </Button>

                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <XCircle className="h-12 w-12 text-red-500" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Treatment Not Found</h3>
                                    <p className="text-muted-foreground mb-4">{error || 'The requested treatment could not be found.'}</p>
                                    <Button onClick={() => router.push('/treatments')}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Treatments
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>{treatment?.name || 'Treatment'} - Fuse Admin</title>
                <meta name="description" content={`Treatment details for ${treatment?.name || 'Unknown Treatment'}`} />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/treatments')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Treatments
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">{treatment?.name || 'Unknown Treatment'}</h1>
                                <p className="text-muted-foreground">Detailed treatment information and associated products</p>
                            </div>
                        </div>
                        {getStatusBadge(treatment.active)}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Treatment Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Treatment Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Stethoscope className="h-5 w-5" />
                                        Treatment Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Treatment Logo */}
                                        {treatment?.treatmentLogo && (
                                            <div className="mb-4">
                                                <img
                                                    src={treatment.treatmentLogo}
                                                    alt={treatment?.name || 'Treatment'}
                                                    className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                                                />
                                            </div>
                                        )}

                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-muted-foreground">Treatment Name:</span>
                                                <p className="font-semibold">{treatment?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Status:</span>
                                                <div className="mt-1">{getStatusBadge(treatment.active)}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Products Value:</span>
                                                <p className="font-semibold">{formatPrice(treatment.productsPrice)}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <p className="font-semibold">{formatDate(treatment.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Clinic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Clinic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Clinic:</span>
                                            <span className="font-semibold">{treatment.clinic?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Clinic Slug:</span>
                                            <span className="font-semibold">{treatment.clinic?.slug || 'N/A'}</span>
                                        </div>
                                        {treatment.clinic?.logo && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Clinic Logo:</span>
                                                <img
                                                    src={treatment.clinic.logo}
                                                    alt={treatment.clinic?.name || 'Unknown Clinic'}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Associated Products */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Associated Products ({(treatment?.products || []).length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(treatment?.products || []).length > 0 ? (
                                            (treatment?.products || []).map((product) => (
                                                <div key={product.id} className="flex justify-between items-start p-4 border rounded-lg">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{product.name || 'N/A'}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Base Price: {formatPrice(product.price || 0)}
                                                        </p>
                                                        {product.pharmacyProductId && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Pharmacy ID: {product.pharmacyProductId}
                                                            </p>
                                                        )}
                                                        {product.dosage && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Default Dosage: {product.dosage}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{formatPrice(product.price || 0)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                No products associated with this treatment
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Treatment Plans */}
                            {treatment?.treatmentPlans && treatment.treatmentPlans.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Treatment Plans</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(treatment?.treatmentPlans || []).map((plan) => (
                                                <div key={plan.id} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold">{plan.name || 'N/A'}</h4>
                                                        <Badge variant={plan.active ? "default" : "secondary"}>
                                                            {plan.active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    {plan.popular && (
                                                        <Badge variant="outline" className="mb-2">Popular</Badge>
                                                    )}
                                                    <p className="text-lg font-bold text-primary">{formatPrice(plan.price || 0)}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        Billed {plan.billingInterval || 'N/A'}
                                                    </p>
                                                    {plan.description && (
                                                        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                                                    )}
                                                    {plan.stripePriceId && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Stripe ID: {plan.stripePriceId}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Associated Questionnaires */}
                            {treatment?.questionnaires && treatment.questionnaires.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Questionnaires</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(treatment?.questionnaires || []).map((questionnaire) => (
                                                <div key={questionnaire.id} className="p-3 border rounded-lg">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold">{questionnaire.title || 'N/A'}</h4>
                                                        <Badge variant={questionnaire.active ? "default" : "secondary"}>
                                                            {questionnaire.active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    {questionnaire.description && (
                                                        <p className="text-sm text-muted-foreground">{questionnaire.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Treatment Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Treatment Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Products:</span>
                                            <span className="font-semibold">{(treatment?.products || []).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Treatment Plans:</span>
                                            <span className="font-semibold">{(treatment?.treatmentPlans || []).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Questionnaires:</span>
                                            <span className="font-semibold">{(treatment?.questionnaires || []).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Updated:</span>
                                            <span className="font-semibold">{formatDate(treatment?.updatedAt)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
