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
    CheckCircle,
    XCircle,
    ShoppingCart,
    Users,
    FileText,
    Edit,
    Palette
} from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    description?: string
    pharmacyProductId?: string
    dosage?: string
    imageUrl?: string | null
    activeIngredients?: string[]
    active: boolean
    createdAt: string
    updatedAt: string
    pharmacyWholesaleCost?: number
    suggestedRetailPrice?: number
    slug?: string | null
}

interface TenantProductData {
    id: string
    productId: string
    clinicId: string
    price: number
    stripeProductId?: string
    stripePriceId?: string
    active: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProductDetail() {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [templates, setTemplates] = useState<any[]>([])
    const [tenantProduct, setTenantProduct] = useState<TenantProductData | null>(null)
    const [editingPrice, setEditingPrice] = useState(false)
    const [newPrice, setNewPrice] = useState<string>('')
    const [savingPrice, setSavingPrice] = useState(false)
    const [enabledForms, setEnabledForms] = useState<any[]>([])
    const [enablingId, setEnablingId] = useState<string | null>(null)
    const [productStats, setProductStats] = useState<{ totalOrders: number; activeSubscribers: number }>({
        totalOrders: 0,
        activeSubscribers: 0
    })
    const [clinicSlug, setClinicSlug] = useState<string | null>(null)
    const [customizations, setCustomizations] = useState<Record<string, { customColor?: string | null; isActive: boolean }>>({})
    const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null)

    const { user, token, authenticatedFetch } = useAuth()
    const [copiedPreview, setCopiedPreview] = useState<boolean>(false)
    const router = useRouter()
    const { id } = router.query

    // Preset colors
    const presetColors = [
        { name: "Ocean Blue", color: "#0EA5E9" },
        { name: "Purple", color: "#A855F7" },
        { name: "Emerald", color: "#10B981" },
        { name: "Rose", color: "#F43F5E" },
        { name: "Amber", color: "#F59E0B" },
        { name: "Indigo", color: "#6366F1" },
        { name: "Pink", color: "#EC4899" },
        { name: "Teal", color: "#14B8A6" },
    ]

    // Fetch customizations
    useEffect(() => {
        const loadCustomizations = async () => {
            if (!token) return

            try {
                const res = await fetch(`${API_URL}/admin/questionnaire-customizations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (res.ok) {
                    const data = await res.json()
                    const customizationsMap: Record<string, { customColor?: string; isActive: boolean }> = {}
                    
                    if (Array.isArray(data?.data)) {
                        data.data.forEach((c: any) => {
                            customizationsMap[c.questionnaireId] = {
                                customColor: c.customColor,
                                isActive: c.isActive
                            }
                        })
                    }
                    
                    setCustomizations(customizationsMap)
                }
            } catch (err) {
                console.error('Error fetching customizations:', err)
            }
        }
        loadCustomizations()
    }, [token])

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerOpen && !(event.target as Element).closest('.color-picker-container')) {
                setColorPickerOpen(null)
            }
        }

        if (colorPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [colorPickerOpen])

    // Fetch clinic information
    useEffect(() => {
        const fetchClinic = async () => {
            if (!token || !user?.clinicId) return

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clinic/${user.clinicId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.data) {
                        setClinicSlug(data.data.slug)
                    }
                }
            } catch (err) {
                console.error('Failed to load clinic:', err)
            }
        }
        fetchClinic()
    }, [token, user?.clinicId])

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            if (!token || !id) return

            try {
                setLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setProduct(data.data)
                    } else {
                        setError(data.message || 'Failed to load product')
                    }
                } else {
                    setError('Failed to load product')
                }
            } catch (err) {
                setError('Failed to load product')
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [token, id])

    // Fetch tenant product, templates, and stats
    useEffect(() => {
        const fetchData = async () => {
            if (!token || !id || !user) return

            try {
                const userWithClinic: any = user
                const clinicId = userWithClinic?.clinicId

                // Fetch tenant products, templates, and forms in parallel
                const [tpRes, templatesRes, tpfRes, ordersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/product/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms?productId=${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    clinicId ? fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders?clinicId=${clinicId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }) : Promise.resolve(null)
                ])

                // Process tenant product
                if (tpRes.ok) {
                    const list = await tpRes.json().then(r => r?.data || [])
                    const tenantProd = list.find((r: any) => r?.productId === id)
                    setTenantProduct(tenantProd || null)
                }

                // Process templates
                if (templatesRes.ok) {
                    const data = await templatesRes.json()
                    setTemplates(Array.isArray(data?.data) ? data.data : [])
                }

                // Process enabled forms
                if (tpfRes.ok) {
                    const data = await tpfRes.json()
                    setEnabledForms(Array.isArray(data?.data) ? data.data : [])
                }

                // Process orders to get stats
                if (ordersRes && ordersRes.ok) {
                    const ordersData = await ordersRes.json()
                    const allOrders = ordersData?.data?.orders || []
                    const productOrders = allOrders.filter((order: any) =>
                        order.orderItems?.some((item: any) => item.productId === id)
                    )
                    setProductStats({
                        totalOrders: productOrders.length,
                        activeSubscribers: 0 // TODO: Count active subscriptions for this product
                    })
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            }
        }
        fetchData()
    }, [token, id, user])

    const handleUpdatePrice = async () => {
        if (!tenantProduct || !token) return

        const priceValue = parseFloat(newPrice)
        if (isNaN(priceValue) || priceValue <= 0) {
            setError('Please enter a valid price greater than $0')
            return
        }

        try {
            setSavingPrice(true)
            setError(null)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tenantProductId: tenantProduct.id,
                    price: priceValue
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to update price')
            }

            const data = await response.json()

            if (data.success) {
                setTenantProduct({ ...tenantProduct, price: priceValue })
                setEditingPrice(false)
                setNewPrice('')
                setError('✅ Price updated successfully!')
                setTimeout(() => setError(null), 3000)
            } else {
                throw new Error(data.message || 'Failed to update price')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update price')
        } finally {
            setSavingPrice(false)
        }
    }

    const fetchCustomizations = async () => {
        if (!token) return

        try {
            const res = await fetch(`${API_URL}/admin/questionnaire-customizations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const data = await res.json()
                const customizationsMap: Record<string, { customColor?: string; isActive: boolean }> = {}
                
                if (Array.isArray(data?.data)) {
                    data.data.forEach((c: any) => {
                        customizationsMap[c.questionnaireId] = {
                            customColor: c.customColor,
                            isActive: c.isActive
                        }
                    })
                }
                
                setCustomizations(customizationsMap)
            }
        } catch (err) {
            console.error('Error fetching customizations:', err)
        }
    }

    const enableTemplate = async (questionnaireId: string) => {
        if (!token || !id) return
        setEnablingId(questionnaireId)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(id), questionnaireId })
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                try {
                    const json = JSON.parse(text)
                    throw new Error(json?.message || `Failed to enable form (${res.status})`)
                } catch {
                    throw new Error(text || `Failed to enable form (${res.status})`)
                }
            }

            const data = await res.json().catch(() => ({} as any))
            if (data?.success && data?.data) {
                setEnabledForms(prev => [...prev.filter((f: any) => f?.questionnaireId !== questionnaireId), data.data])
                // Reload customizations
                await fetchCustomizations()
                // TenantProduct creation is ensured by the backend before creating the form
                window.location.reload()
            } else {
                throw new Error(data?.message || 'Failed to enable form')
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to enable form')
        } finally {
            setEnablingId(null)
        }
    }

    const enableTemplateWithVariant = async (questionnaireId: string, currentFormVariant: string) => {
        if (!token || !id) return
        setEnablingId(questionnaireId)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(id), questionnaireId, currentFormVariant })
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                try {
                    const json = JSON.parse(text)
                    throw new Error(json?.message || `Failed to enable form (${res.status})`)
                } catch {
                    throw new Error(text || `Failed to enable form (${res.status})`)
                }
            }

            const data = await res.json().catch(() => ({} as any))
            if (data?.success && data?.data) {
                setEnabledForms(prev => [...prev.filter((f: any) => f?.questionnaireId !== questionnaireId), data.data])
                window.location.reload()
            } else {
                throw new Error(data?.message || 'Failed to enable form')
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to enable form')
        } finally {
            setEnablingId(null)
        }
    }

    const switchToVariant = async (questionnaireId: string, currentFormVariant: string) => {
        if (!token || !id) return
        setEnablingId(questionnaireId)
        try {
            // Disable current mapping first
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(id), questionnaireId })
            })
            // Re-enable with new variant
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: String(id), questionnaireId, currentFormVariant })
            })
            if (!res.ok) {
                const text = await res.text().catch(() => '')
                try { const json = JSON.parse(text); throw new Error(json?.message || `Failed to switch variant (${res.status})`) } catch { throw new Error(text || `Failed to switch variant (${res.status})`) }
            }
            window.location.reload()
        } catch (e: any) {
            setError(e?.message || 'Failed to switch variant')
        } finally {
            setEnablingId(null)
        }
    }

    const disableTemplate = async (questionnaireId: string) => {
        if (!token || !id) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id, questionnaireId })
            })

            if (!res.ok) {
                throw new Error('Failed to disable form')
            }

            setEnabledForms(prev => prev.filter((f: any) => f?.questionnaireId !== questionnaireId))
        } catch (e: any) {
            setError(e?.message || 'Failed to disable form')
        }
    }

    const updateFormColor = async (questionnaireId: string, color: string) => {
        if (!token) return
        
        try {
            // Empty string means "clear color" - send null to backend
            const colorValue = color === '' ? null : color;
            
            const res = await fetch(`${API_URL}/admin/questionnaire-customization/color`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ questionnaireId, customColor: colorValue })
            })

            if (!res.ok) {
                throw new Error('Failed to update color')
            }

            setCustomizations(prev => ({
                ...prev,
                [questionnaireId]: {
                    ...prev[questionnaireId],
                    customColor: colorValue
                }
            }))

            setColorPickerOpen(null)
            const message = colorValue ? '✅ Color updated successfully!' : '✅ Color cleared - using clinic default';
            setError(message)
            setTimeout(() => setError(null), 2000)
        } catch (e: any) {
            setError(e?.message || 'Failed to update color')
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const getStatusBadge = (active: boolean) => {
        return active
            ? <Badge variant="outline" className="text-xs font-medium"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
            : <Badge variant="outline" className="text-xs font-medium text-muted-foreground"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
    }

    const buildPreviewUrl = () => {
        if (!product?.slug || !clinicSlug) return null
        
        // Build dynamic subdomain URL based on user's clinic
        const isLocalhost = process.env.NODE_ENV !== 'production'
        const baseUrl = isLocalhost 
            ? `http://${clinicSlug}.localhost:3000`
            : `https://${clinicSlug}.fuse.health`
        
        return `${baseUrl}/my-products/${product.slug}`
    }

    const handleCopyPreview = async () => {
        const url = buildPreviewUrl()
        if (!url) return
        try {
            await navigator.clipboard.writeText(url)
            setCopiedPreview(true)
            setTimeout(() => setCopiedPreview(false), 1500)
        } catch { }
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading product...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error && !product) {
        return (
            <Layout>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button variant="outline" onClick={() => router.push('/products')} className="mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Button>
                        <Card className="p-12 text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </Card>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>{product?.name || 'Product'} - Fuse Admin</title>
            </Head>

            <div className="w-full bg-background p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <Button
                        variant="outline"
                        onClick={() => router.push('/products')}
                        className="mb-6 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>

                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground mb-2">{product?.name}</h1>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{product?.description}</p>
                            {product?.dosage && (
                                <p className="text-sm text-muted-foreground mt-1">Dosage: <span className="font-medium">{product.dosage}</span></p>
                            )}
                        </div>
                        {product && getStatusBadge(product.active)}
                    </div>

                    {/* Success/Error Messages */}
                    {error && (
                        <div className={`mb-6 p-4 border rounded-md ${error.includes('✅') ? 'bg-background border-border' : 'bg-background border-red-200'}`}>
                            <p className={error.includes('✅') ? 'text-foreground' : 'text-red-600 text-sm'}>{error}</p>
                        </div>
                    )}

                    {/* PRIORITY 1: Pricing & Configuration */}
                    <Card className="mb-6 border-border shadow-sm">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-lg font-semibold">Pricing & Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">

                            {/* Pricing Section */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Pharmacy Cost */}
                                    <div className="p-5 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Pharmacy Wholesale Cost</div>
                                        <div className="text-xs text-muted-foreground mb-3">What you pay</div>
                                        <div className="text-3xl font-semibold text-foreground">
                                            {product ? formatPrice(product.price) : '$0.00'}
                                        </div>
                                    </div>

                                    {/* Retail Price */}
                                    {tenantProduct ? (
                                        <div className="p-5 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Retail Price</div>
                                                {!editingPrice && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 px-2 text-xs font-medium hover:bg-muted"
                                                        onClick={() => {
                                                            setEditingPrice(true)
                                                            setNewPrice(tenantProduct.price.toString())
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground mb-3">What customers pay</div>

                                            {editingPrice ? (
                                                <div>
                                                    <div className="mb-3">
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={newPrice}
                                                                onChange={(e) => setNewPrice(e.target.value)}
                                                                className="w-full pl-8 pr-3 py-2 text-2xl font-semibold border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={handleUpdatePrice} disabled={savingPrice} className="flex-1">
                                                            {savingPrice ? 'Saving...' : 'Save'}
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setEditingPrice(false)
                                                            setNewPrice('')
                                                        }} disabled={savingPrice}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                                        {(() => {
                                                            const price = parseFloat(newPrice) || 0
                                                            const cost = product?.price || 0
                                                            const profit = price - cost
                                                            const margin = price > 0 ? ((profit / price) * 100) : 0
                                                            return `Profit: ${formatPrice(profit)} (${margin.toFixed(1)}% margin)`
                                                        })()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-3xl font-semibold text-foreground">
                                                        {formatPrice(tenantProduct.price)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                                        {(() => {
                                                            const price = tenantProduct.price
                                                            const cost = product?.price || 0
                                                            const profit = price - cost
                                                            const margin = price > 0 ? ((profit / price) * 100) : 0
                                                            return `Profit: ${formatPrice(profit)} per unit (${margin.toFixed(1)}% margin)`
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-5 border border-dashed border-border rounded-lg bg-muted/30 flex items-center justify-center">
                                            <p className="text-sm text-muted-foreground text-center">
                                                Enable this product to set custom pricing
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Forms Section */}
                            <div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Product Forms</h3>
                                {templates.length === 0 ? (
                                    <div className="p-6 border border-dashed border-border rounded-lg text-center bg-muted/20">
                                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No forms available for this product</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {templates.map(t => {
                                            const existingForm = enabledForms.find((f: any) => f?.questionnaireId === t.id)
                                            const currentVariant: string | null = existingForm?.currentFormVariant ?? null
                                            return (
                                                <div key={t.id} className="p-4 border border-border rounded-lg hover:shadow-sm transition-all bg-card space-y-3">
                                                    {[1, 2].map((variantNum) => {
                                                        const pv = buildPreviewUrl()
                                                        const previewUrl = pv ? pv.replace('/my-products/', `/my-products/${variantNum}/`) : null
                                                        const variantKey = String(variantNum)
                                                        const isVariantEnabled = !!existingForm && currentVariant === variantKey
                                                        const hasAnyEnabled = !!existingForm
                                                        return (
                                                            <div key={`${t.id}-${variantNum}`} className="border border-dashed border-border rounded-md p-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-foreground">{t.title}</div>
                                                                        <div className="text-xs text-muted-foreground mt-0.5">{t.formTemplateType || 'Standard Form'} • Variant {variantNum}</div>
                                                                    </div>
                                                                    {hasAnyEnabled ? (
                                                                        <div className="flex items-center gap-3">
                                                                            {isVariantEnabled ? (
                                                                                <>
                                                                                    {/* Color Picker */}
                                                                                    <div className="relative color-picker-container">
                                                                                        <button
                                                                                            onClick={() => setColorPickerOpen(colorPickerOpen === t.id ? null : t.id)}
                                                                                            className="w-8 h-8 rounded border-2 border-border hover:border-muted-foreground transition-colors flex items-center justify-center"
                                                                                            style={{ 
                                                                                                backgroundColor: customizations[t.id]?.customColor || 'transparent',
                                                                                                backgroundImage: !customizations[t.id]?.customColor 
                                                                                                    ? 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb)'
                                                                                                    : 'none',
                                                                                                backgroundSize: '8px 8px',
                                                                                                backgroundPosition: '0 0, 4px 4px'
                                                                                            }}
                                                                                            title={customizations[t.id]?.customColor ? 'Change form color' : 'Set custom color (currently using clinic default)'}
                                                                                        >
                                                                                            <Palette className="h-4 w-4 text-muted-foreground" />
                                                                                        </button>
                                                                                        
                                                                                        {/* Color Palette Dropdown */}
                                                                                        {colorPickerOpen === t.id && (
                                                                                            <div className="absolute right-0 mt-2 p-3 bg-card border border-border rounded-lg shadow-lg z-10 w-48">
                                                                                                <p className="text-xs font-medium text-foreground mb-2">Select Color</p>
                                                                                                <div className="grid grid-cols-4 gap-2 mb-3">
                                                                                                    {presetColors.map((preset) => (
                                                                                                        <button
                                                                                                            key={preset.color}
                                                                                                            onClick={() => updateFormColor(t.id, preset.color)}
                                                                                                            className="w-10 h-10 rounded border-2 border-border hover:border-muted-foreground transition-colors"
                                                                                                            style={{ backgroundColor: preset.color }}
                                                                                                            title={preset.name}
                                                                                                        />
                                                                                                    ))}
                                                                                                </div>
                                                                                                {customizations[t.id]?.customColor && (
                                                                                                    <button
                                                                                                        onClick={() => updateFormColor(t.id, '')}
                                                                                                        className="w-full text-xs py-1.5 px-2 text-muted-foreground hover:text-foreground border border-border hover:border-muted-foreground rounded transition-colors"
                                                                                                    >
                                                                                                        Clear (use clinic default)
                                                                                                    </button>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    
                                                                                    <Button size="sm" variant="outline" onClick={() => disableTemplate(t.id)}>
                                                                                        Disable
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <Button size="sm" onClick={() => switchToVariant(t.id, String(variantNum))} disabled={enablingId === t.id}>
                                                                                    {enablingId === t.id ? 'Enabling...' : 'Enable for Clinic'}
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <Button size="sm" onClick={() => enableTemplateWithVariant(t.id, String(variantNum))} disabled={enablingId === t.id}>
                                                                            {enablingId === t.id ? 'Enabling...' : 'Enable for Clinic'}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                                {previewUrl && (
                                                                    <div className="mt-3 flex items-center justify-between">
                                                                        <div className="text-xs text-muted-foreground truncate">
                                                                            Preview URL: <span className="text-foreground">{previewUrl}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button size="sm" variant="outline" onClick={() => window.open(previewUrl, '_blank')}>Preview</Button>
                                                                            <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(previewUrl) }}>
                                                                                Copy
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* PRIORITY 2: Product Performance */}
                    <Card className="mb-6 border-border shadow-sm">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-lg font-semibold">Product Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-6">

                                {/* Total Orders */}
                                <div className="p-5 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</span>
                                    </div>
                                    <div className="text-3xl font-semibold text-foreground">{productStats.totalOrders}</div>
                                    <p className="text-xs text-muted-foreground mt-2">All-time orders for this product</p>
                                </div>

                                {/* Active Subscribers */}
                                <div className="p-5 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Subscribers</span>
                                    </div>
                                    <div className="text-3xl font-semibold text-foreground">{productStats.activeSubscribers}</div>
                                    <p className="text-xs text-muted-foreground mt-2">Customers with active subscriptions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card className="border-border shadow-sm">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-lg font-semibold">Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Pharmacy Product ID</span>
                                    <p className="font-medium text-foreground mt-1">{product?.pharmacyProductId || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs uppercase tracking-wide">Default Dosage</span>
                                    <p className="font-medium text-foreground mt-1">{product?.dosage || 'N/A'}</p>
                                </div>
                                {product?.activeIngredients && product.activeIngredients.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground text-xs uppercase tracking-wide">Active Ingredients</span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {product.activeIngredients.map((ing, i) => (
                                                <Badge key={i} variant="outline" className="text-xs font-normal">{ing}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}
