import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Stethoscope,
    Loader2,
    Sparkles,
    Palette,
    ImageIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
    RefreshCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfferingItem {
    id: string
    name: string
    slug: string
    treatmentLogo?: string | null
    active: boolean
    selected: boolean
    brandLogo?: string | null
    brandColor?: string | null
    clinicSlug?: string | null
}

type Status = 'idle' | 'loading' | 'saving'

export default function OfferingsPage() {
    const { token, user } = useAuth()
    const router = useRouter()

    const [offerings, setOfferings] = useState<OfferingItem[]>([])
    const [status, setStatus] = useState<Status>('idle')
    const [error, setError] = useState<string | null>(null)
    const [dirty, setDirty] = useState(false)
    const [pendingSelection, setPendingSelection] = useState<Record<string, OfferingItem>>({})

    const fetchOfferings = useCallback(async () => {
        if (!token) return

        setStatus('loading')
        setError(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-treatments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const text = await response.text()
                setError(`Failed to load offerings: ${response.status} ${response.statusText}`)
                console.error('❌ Offerings fetch error:', text)
                setStatus('idle')
                return
            }

            const data = await response.json()

            if (!data.success) {
                setError(data.message || 'Failed to load offerings')
                setStatus('idle')
                return
            }

            const slugified = (data.data || []).map((item: OfferingItem) => ({
                ...item,
                slug:
                    item.slug ||
                    item.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, ''),
            }))

            setOfferings(slugified)
        } catch (err) {
            console.error('❌ Exception while loading offerings:', err)
            setError('Failed to load offerings. Please try again later.')
        } finally {
            setStatus('idle')
            setDirty(false)
            setPendingSelection({})
        }
    }, [token])

    useEffect(() => {
        if (!token) {
            router.replace('/signin')
            return
        }

        fetchOfferings()
    }, [token, router, fetchOfferings])

    const handleToggle = async (item: OfferingItem) => {
        if (!token) return

        setStatus('saving')
        setError(null)

        const optimistic = offerings.map((existing) =>
            existing.id === item.id
                ? {
                    ...existing,
                    selected: !existing.selected,
                }
                : existing,
        )

        setOfferings(optimistic)
        setDirty(true)
        setPendingSelection((prev) => ({
            ...prev,
            [item.id]: {
                ...item,
                selected: !item.selected,
            },
        }))

        try {
            if (item.selected) {
                // Currently selected -> remove selection
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-treatments`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ treatmentId: item.id }),
                })

                if (!response.ok) {
                    const text = await response.text()
                    throw new Error(`Delete failed: ${text}`)
                }
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/brand-treatments`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ treatmentId: item.id }),
                })

                if (!response.ok) {
                    const text = await response.text()
                    throw new Error(`Save failed: ${text}`)
                }
            }

            setPendingSelection((prev) => {
                const clone = { ...prev }
                delete clone[item.id]
                return clone
            })
        } catch (err) {
            console.error('❌ Error toggling offering:', err)
            setError('Failed to update selection. Reverting change.')
            // Revert optimistic update
            setOfferings((prev) =>
                prev.map((existing) =>
                    existing.id === item.id
                        ? {
                            ...existing,
                            selected: item.selected,
                        }
                        : existing,
                ),
            )
        } finally {
            setStatus('idle')
        }
    }

    const selectedCount = useMemo(() => offerings.filter((o) => o.selected).length, [offerings])
    const hasPending = useMemo(() => Object.keys(pendingSelection).length > 0, [pendingSelection])

    const handleRefresh = () => {
        fetchOfferings()
    }

    return (
        <Layout>
            <Head>
                <title>Offerings - Fuse Admin</title>
                <meta name="description" content="Manage which treatments your brand offers" />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                                <Sparkles className="h-7 w-7 text-primary" /> Offerings
                            </h1>
                            <p className="text-muted-foreground max-w-2xl">
                                Select the treatments that your brand offers. Selections control which services appear
                                across onboarding, product catalogs, and marketing flows.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleRefresh} disabled={status === 'loading'}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button variant="outline" disabled>
                                Selected: {selectedCount}
                            </Button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-700">{error}</p>
                                <p className="text-xs text-muted-foreground">
                                    If the problem persists, contact support or refresh the page.
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'loading' ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                                <p className="mt-4 text-muted-foreground">Loading available treatments...</p>
                            </div>
                        </div>
                    ) : offerings.length === 0 ? (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Sparkles className="h-12 w-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No treatments available yet</h3>
                                    <p className="text-muted-foreground">
                                        Once treatments have been configured by the Fuse team, they will appear here for you to
                                        activate.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {offerings.map((item) => {
                                const isSavingThisItem = Boolean(pendingSelection[item.id])
                                const clinicSlug = item.clinicSlug || 'limitless.health'
                                const devUrl = `http://${clinicSlug}.localhost:3000/my-treatments/${item.slug}`
                                const prodDisplay = `${clinicSlug}.fuse.health/my-treatments/${item.slug}`
                                const previewDisplay = process.env.NODE_ENV === 'production' ? prodDisplay : devUrl
                                const previewHref = process.env.NODE_ENV === 'production' ? `https://${prodDisplay}` : devUrl
                                return (
                                    <Card
                                        key={item.id}
                                        className={cn(
                                            'transition-shadow hover:shadow-lg border border-border',
                                            item.selected ? 'ring-2 ring-primary/40 shadow-primary/20 shadow-lg' : '',
                                        )}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg">
                                                        <Stethoscope className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{item.name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground">{item.active ? 'Active' : 'Inactive'}</p>
                                                    </div>
                                                </div>
                                                {item.selected ? (
                                                    <span className="inline-flex items-center text-xs font-medium text-green-600 gap-1">
                                                        <CheckCircle className="h-4 w-4" /> Enabled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-xs font-medium text-muted-foreground gap-1">
                                                        <XCircle className="h-4 w-4" /> Disabled
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {item.treatmentLogo ? (
                                                <div className="relative">
                                                    <img
                                                        src={item.treatmentLogo}
                                                        alt={`${item.name} logo`}
                                                        className="w-full h-36 object-cover rounded-lg border"
                                                    />
                                                    {item.brandLogo && (
                                                        <div className="absolute bottom-2 right-2 bg-background/90 border rounded px-3 py-1 shadow-sm text-xs flex items-center gap-2">
                                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                            <span>Brand logo applied</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full h-36 border rounded-lg flex items-center justify-center bg-muted/30 text-muted-foreground text-sm">
                                                    No imagery configured
                                                </div>
                                            )}

                                            <div className="space-y-3 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Palette className="h-4 w-4" />
                                                    <span>
                                                        Brand Color:{' '}
                                                        <span className="font-medium text-foreground">
                                                            {item.brandColor || 'Default Theme'}
                                                        </span>
                                                    </span>
                                                </div>
                                                <p>
                                                    Selecting this treatment enables the related offerings across the entire platform,
                                                    including checkout flows, onboarding forms, and marketing experiences.
                                                </p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground">Preview URL:</span>
                                                    <code className="px-2 py-1 bg-muted/30 rounded border">
                                                        {previewDisplay}
                                                    </code>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant={item.selected ? 'outline' : 'default'}
                                                    className="w-full"
                                                    disabled={status === 'saving'}
                                                    onClick={() => handleToggle(item)}
                                                >
                                                    {status === 'saving' && isSavingThisItem ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : item.selected ? (
                                                        'Disable Offering'
                                                    ) : (
                                                        'Enable Offering'
                                                    )}
                                                </Button>
                                                <a
                                                    href={previewHref}
                                                    className="w-full"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button variant="ghost" className="w-full">
                                                        Preview
                                                    </Button>
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {dirty && !hasPending && (
                        <div className="mt-8 rounded-md bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-emerald-700">Selections updated</p>
                                <p className="text-xs text-muted-foreground">
                                    All changes have been saved. It may take a few minutes for updates to propagate across
                                    customer experiences.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

