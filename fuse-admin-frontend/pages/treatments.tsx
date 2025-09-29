import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    Stethoscope,
    Plus,
    Edit,
    Eye,
    DollarSign,
    Activity,
    Package,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react'

interface Treatment {
    id: string
    name: string
    treatmentLogo?: string
    productsPrice: number
    active: boolean
    stripeProductId?: string
    userId: string
    clinicId: string
    createdAt: string
    updatedAt: string
    products?: Array<{
        id: string
        name: string
        price: number
    }>
    clinic?: {
        id: string
        name: string
        slug: string
    }
}

export default function Treatments() {
    const [treatments, setTreatments] = useState<Treatment[]>([])
    const [loading, setLoading] = useState(false)  // Start with false, set to true when fetching
    const [error, setError] = useState<string | null>(null)
    const { user, token } = useAuth()
    const router = useRouter()

    // Cast user to include clinicId property
    const userWithClinic = user as any

    const fetchTreatments = useCallback(async () => {
        console.log('🔍 🔄 STARTING TREATMENTS FETCH PROCESS')
        console.log('🔍 User data:', user)
        console.log('🔍 Token:', token)
        console.log('🔍 Clinic ID:', userWithClinic?.clinicId)

        // Set loading to true at the start of the fetch process
        setLoading(true)
        setError(null)

        if (!token) {
            console.log('❌ No token available, skipping fetch')
            setError('No authentication token found')
            setLoading(false)
            return
        }

        if (!userWithClinic?.clinicId) {
            console.log('❌ No clinicId in user data, skipping fetch')
            setError('❌ Clinic Access Required: Your account is not assigned to any clinic. Please contact support to get access to clinic data, or try logging out and back in if you recently joined a clinic.')
            setLoading(false)
            return
        }

        console.log('✅ Authentication passed, proceeding with fetch')
        console.log('🔍 🚀 STARTING ACTUAL TREATMENTS FETCH')
        console.log('🔍 Target clinic ID:', userWithClinic.clinicId)
        console.log('🔍 API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/treatments/by-clinic-id/${userWithClinic.clinicId}`)

        try {
            setLoading(true)
            console.log('🔍 Setting loading to true')

            // Fetch treatments for the clinic with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
                console.log('⏰ Request timed out after 30 seconds')
                controller.abort()
            }, 30000) // 30 second timeout

            console.log('🔍 Making fetch request...')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/treatments/by-clinic-id/${userWithClinic.clinicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            })
            clearTimeout(timeoutId)

            console.log('🔍 📡 Response received!')
            console.log('🔍 Response status:', response.status)
            console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))

            if (response.ok) {
                console.log('✅ Response OK, parsing JSON...')
                const data = await response.json()
                console.log('🔍 ✅ Response data received:', data)

                if (data.success) {
                    console.log('✅ API call successful!')
                    const treatments = data.data || []
                    console.log('🔍 Treatments count:', treatments.length)
                    console.log('🔍 Setting treatments state with:', treatments.length, 'treatments')

                    setTreatments(treatments)

                    if (treatments.length === 0) {
                        console.log('ℹ️ No treatments found for this clinic')
                        setError('No treatments found for your clinic')
                    } else {
                        console.log('✅ Treatments loaded successfully:', treatments.length, 'treatments')
                    }
                } else {
                    console.error('❌ API returned success=false:', data.message)
                    setError(data.message || 'Failed to load treatments')
                }
            } else {
                const errorText = await response.text()
                console.error('❌ HTTP error response:', response.status, response.statusText)
                console.error('❌ Error body:', errorText)
                setError(`Failed to load treatments: ${response.status} ${response.statusText}`)
            }

        } catch (err) {
            console.error('❌ Exception during fetch:', err)
            if (err instanceof Error && err.name === 'AbortError') {
                console.error('⏰ Request was aborted due to timeout')
                setError('Request timed out. Please try again.')
            } else {
                console.error('❌ Other error type:', err)
                setError('Failed to load treatments')
            }
        } finally {
            console.log('🔍 Setting loading to false')
            setLoading(false)
        }
    }, [token, userWithClinic?.clinicId])

    useEffect(() => {
        console.log('🔍 Treatments useEffect running')
        fetchTreatments()
    }, [fetchTreatments])

    // Debug: Check if component is working at all
    useEffect(() => {
        console.log('🔍 Treatments page loaded!')
        console.log('🔍 User object:', user)
        console.log('🔍 Token object:', token)

        // Check after a short delay to see if auth state changes
        const timer = setTimeout(() => {
            console.log('🔍 Treatments - After delay - User object:', user)
            console.log('🔍 Treatments - After delay - Token object:', token)
            console.log('🔍 Treatments - After delay - User clinicId:', (user as any)?.clinicId)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

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

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading treatments...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>Treatments - Fuse Admin</title>
                <meta name="description" content="Manage your clinic treatments" />
            </Head>

            <div className="min-h-screen bg-background p-6">
                {/* Debug Panel */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-green-800 mb-2">🔍 Debug Panel</h3>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                console.log('🔍 Manual trigger of fetchTreatments')
                                fetchTreatments()
                            }}
                        >
                            🔄 Reload Treatments
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                console.log('🔍 Current state:')
                                console.log('- User:', user)
                                console.log('- Token exists:', !!token)
                                console.log('- Clinic ID:', (user as any)?.clinicId)
                                console.log('- Loading:', loading)
                                console.log('- Error:', error)

                                const clinicId = (user as any)?.clinicId || 'null'
                                const hasClinic = !!clinicId && clinicId !== 'null'

                                if (!hasClinic) {
                                    alert(`❌ Clinic ID Issue\n\nCurrent Clinic ID: ${clinicId}\n\n💡 Solutions:\n1. Log out and back in\n2. Clear browser cache\n3. Check if SQL update worked\n4. Contact support if persists`)
                                } else {
                                    alert(`✅ Clinic Access\n\nClinic ID: ${clinicId}\nLoading: ${loading}\nError: ${error || 'none'}`)
                                }
                            }}
                        >
                            📊 Show State
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Treatments</h1>
                            <p className="text-muted-foreground">Manage and monitor your clinic's treatment offerings</p>
                        </div>
                        <Button onClick={() => router.push('/treatments/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Treatment
                        </Button>
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

                    {/* Treatments Grid */}
                    {treatments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {treatments.map((treatment) => (
                                <Card key={treatment.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Stethoscope className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{treatment.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{treatment.clinic?.name}</p>
                                                </div>
                                            </div>
                                            {getStatusBadge(treatment.active)}
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Price Information */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Products Value</span>
                                                </div>
                                                <span className="font-semibold">{formatPrice(treatment.productsPrice)}</span>
                                            </div>

                                            {/* Products Count */}
                                            {treatment.products && (treatment.products || []).length > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Products</span>
                                                    </div>
                                                    <span className="font-semibold">{(treatment.products || []).length}</span>
                                                </div>
                                            )}

                                            {/* Treatment Logo */}
                                            {treatment.treatmentLogo && (
                                                <div className="mt-4">
                                                    <img
                                                        src={treatment.treatmentLogo}
                                                        alt={treatment.name}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => router.push(`/treatments/${treatment.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => router.push(`/treatments/${treatment.id}/edit`)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Stethoscope className="h-12 w-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No treatments found</h3>
                                    <p className="text-muted-foreground mb-4">Get started by creating your first treatment.</p>
                                    <Button onClick={() => router.push('/treatments/new')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Treatment
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    )
}
