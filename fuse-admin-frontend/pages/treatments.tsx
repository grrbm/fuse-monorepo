import { useState, useEffect, useMemo, useRef } from 'react'
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
    Clock,
    Sparkles,
    RefreshCcw,
    Palette,
    Copy,
    Check,
    Loader2,
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
        customDomain?: string
        isCustomDomain?: boolean
    }
    selected?: boolean
    brandColor?: string | null
    brandLogo?: string | null
    slug?: string | null
}

export default function Treatments() {
    const [treatments, setTreatments] = useState<Treatment[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'saving'>('idle')
    const [pendingSelection, setPendingSelection] = useState<Record<string, boolean>>({})
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { user, token } = useAuth()
    const router = useRouter()

    const userWithClinic = user as any

    const fetchTreatments = useMemo(() => async () => {
        setLoading(true)
        setError(null)

        if (!token) {
            setError('No authentication token found')
            setLoading(false)
            return
        }

        if (!userWithClinic?.clinicId) {
            setError('Your account is not assigned to any clinic. Please contact support.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/treatments/by-clinic-id/${userWithClinic.clinicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorText = await response.text()
                setError(`Failed to load treatments: ${response.status} ${response.statusText}`)
                console.error('❌ Error fetching treatments:', errorText)
                return
            }

            const data = await response.json()

            if (!data.success) {
                setError(data.message || 'Failed to load treatments')
                return
            }

            setTreatments(Array.isArray(data.data) ? data.data : [])
        } catch (err) {
            console.error('Error fetching treatments:', err)
            setError('Failed to load treatments')
        } finally {
            setLoading(false)
        }
    }, [token, userWithClinic?.clinicId])

    useEffect(() => {
        fetchTreatments()
    }, [fetchTreatments])

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current)
            }
        }
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

    const handleCopyUrl = (url: string, id: string) => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            console.error('Clipboard API not available')
            return
        }

        navigator.clipboard
            .writeText(url)
            .then(() => {
                setCopiedId(id)
                if (copyTimeoutRef.current) {
                    clearTimeout(copyTimeoutRef.current)
                }
                copyTimeoutRef.current = setTimeout(() => {
                    setCopiedId(null)
                    copyTimeoutRef.current = null
                }, 2000)
            })
            .catch((err) => {
                console.error('Failed to copy preview URL:', err)
            })
    }

    const handleToggleOffering = async (treatment: Treatment) => {
        if (!token) return

        setStatus('saving')
        setPendingSelection((prev) => ({ ...prev, [treatment.id]: !treatment.selected }))

        setTreatments((prev) =>
            prev.map((item) =>
                item.id === treatment.id
                    ? {
                        ...item,
                        selected: !item.selected,
                    }
                    : item,
            ),
        )

        try {
            const method = treatment.selected ? 'DELETE' : 'POST'
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-treatments`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ treatmentId: treatment.id })
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || 'Failed to update offering')
            }

            setPendingSelection((prev) => {
                const clone = { ...prev }
                delete clone[treatment.id]
                return clone
            })
        } catch (err) {
            console.error('❌ Error updating offering status:', err)
            setError('Failed to update offering status. Reverting change.')
            setTreatments((prev) =>
                prev.map((item) =>
                    item.id === treatment.id
                        ? {
                            ...item,
                            selected: treatment.selected,
                        }
                        : item,
                ),
            )
        } finally {
            setStatus('idle')
        }
    }

    const selectedCount = useMemo(() => treatments.filter((t) => t.selected).length, [treatments])
    const hasPending = useMemo(() => Object.keys(pendingSelection).length > 0, [pendingSelection])

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
                <meta name="description" content="Manage treatments and offerings" />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <Stethoscope className="h-7 w-7 text-primary" /> Treatments
                            </h1>
                            <p className="text-muted-foreground max-w-2xl">
                                Review your treatments and enable offerings that power checkout flows, onboarding, and marketing experiences.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => fetchTreatments()}>
                                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
                            </Button>
                            <Button variant="outline" disabled>
                                Selected: {selectedCount}
                            </Button>
                            <Button onClick={() => router.push('/treatments/new')}>
                                <Plus className="h-4 w-4 mr-2" /> New Treatment
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {treatments.length === 0 ? (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Sparkles className="h-12 w-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No treatments found</h3>
                                    <p className="text-muted-foreground">
                                        Once treatments are created, they will appear here for you to configure and enable as offerings.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {treatments.map((treatment) => {
                                const clinicSlug = treatment.clinic?.slug || 'limitless.health'
                                const slug = treatment.slug || treatment.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                                
                                // Build preview URL with custom domain support
                                let previewDisplay = ''
                                let previewHref = ''
                                if (treatment.clinic?.isCustomDomain && treatment.clinic?.customDomain) {
                                    previewDisplay = `app.${treatment.clinic.customDomain}/my-treatments/${slug}`
                                    previewHref = `https://${previewDisplay}`
                                } else {
                                    const isLocalhost = process.env.NODE_ENV !== 'production'
                                    const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true'
                                    const baseDomain = isStaging ? 'fusehealthstaging.xyz' : 'fuse.health'
                                    const devUrl = `http://${clinicSlug}.localhost:3000/my-treatments/${slug}`
                                    const prodDisplay = `${clinicSlug}.${baseDomain}/my-treatments/${slug}`
                                    previewDisplay = isLocalhost ? devUrl : prodDisplay
                                    previewHref = isLocalhost ? devUrl : `https://${prodDisplay}`
                                }
                                
                                const isCopied = copiedId === treatment.id
                                const isSavingThis = pendingSelection[treatment.id] !== undefined
                                return (
                                    <Card key={treatment.id} className="border border-border transition-shadow hover:shadow-lg">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Stethoscope className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{treatment.name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                            Created {new Date(treatment.createdAt).toLocaleDateString()}
                                                            {treatment.products && treatment.products.length > 0 && (
                                                                <span className="inline-flex items-center gap-1">
                                                                    <Package className="h-3 w-3" /> {treatment.products.length} products
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(treatment.active)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {treatment.treatmentLogo ? (
                                                <div className="relative">
                                                    <img
                                                        src={treatment.treatmentLogo}
                                                        alt={`${treatment.name} logo`}
                                                        className="w-full h-36 object-cover rounded-lg border"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full h-36 border rounded-lg flex items-center justify-center bg-muted/30 text-muted-foreground text-sm">
                                                    No imagery configured
                                                </div>
                                            )}

                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>Products Value:</span>
                                                    <span className="font-medium text-foreground">{formatPrice(treatment.productsPrice)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Palette className="h-4 w-4" />
                                                    <span>Brand Color:</span>
                                                    <span className="font-medium text-foreground">{treatment.brandColor || 'Default Theme'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground">Preview URL:</span>
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <code
                                                            className="px-2 py-1 bg-muted/30 rounded border text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap flex-1"
                                                            title={previewDisplay}
                                                        >
                                                            {previewDisplay}
                                                        </code>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-7 w-7 shrink-0 transition-colors ${isCopied ? 'text-green-600' : 'text-muted-foreground'}`}
                                                            onClick={() => handleCopyUrl(previewHref, treatment.id)}
                                                            aria-label={isCopied ? 'Preview URL copied' : 'Copy preview URL'}
                                                        >
                                                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                <Button
                                                    variant={treatment.selected ? 'outline' : 'default'}
                                                    disabled={status === 'saving' && isSavingThis}
                                                    onClick={() => handleToggleOffering(treatment)}
                                                >
                                                    {status === 'saving' && isSavingThis ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : treatment.selected ? 'Disable Offering' : 'Enable Offering'}
                                                </Button>
                                                <a href={previewHref} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" className="w-full">
                                                        Preview
                                                    </Button>
                                                </a>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => router.push(`/treatments/${treatment.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" /> View Details
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => router.push(`/treatments/${treatment.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Activity className="h-3 w-3" />
                                                    {treatment.active ? 'Active' : 'Inactive'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Updated {new Date(treatment.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Treatment Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                                <p className="uppercase text-xs">Total Treatments</p>
                                <p className="text-foreground text-2xl font-semibold">{treatments.length}</p>
                            </div>
                            <div>
                                <p className="uppercase text-xs">Active Offerings</p>
                                <p className="text-foreground text-2xl font-semibold">{selectedCount}</p>
                            </div>
                            <div>
                                <p className="uppercase text-xs">Last Refreshed</p>
                                <p className="text-foreground text-2xl font-semibold">{new Date().toLocaleTimeString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {status === 'saving' && hasPending && (
                        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                            Saving changes...
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
