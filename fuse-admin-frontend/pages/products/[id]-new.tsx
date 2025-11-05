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
    Edit
} from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    description?: string
    pharmacyProductId?: string
    placeholderSig?: string
    imageUrl?: string | null
    activeIngredients?: string[]
    active: boolean
    createdAt: string
    updatedAt: string
    pharmacyWholesaleCost?: number
    suggestedRetailPrice?: number
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

    const { user, token } = useAuth()
    const router = useRouter()
    const { id } = router.query

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

    const enableTemplate = async (questionnaireId: string) => {
        if (!token || !id) return
        setEnablingId(questionnaireId)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/tenant-product-forms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id, questionnaireId })
            })

            if (!res.ok) {
                throw new Error('Failed to enable form')
            }

            const data = await res.json()
            if (data?.data) {
                setEnabledForms(prev => [...prev.filter((f: any) => f?.questionnaireId !== questionnaireId), data.data])

                // Also create TenantProduct if needed
                if (!tenantProduct) {
                    const tpRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products/update-selection`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ products: [{ productId: id, questionnaireId }] })
                    })
                    if (tpRes.ok) {
                        window.location.reload() // Reload to get tenant product data
                    }
                }
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to enable form')
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const getStatusBadge = (active: boolean) => {
        return active
            ? <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
            : <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
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

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <Button variant="outline" onClick={() => router.push('/products')} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Products
                    </Button>

                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1">{product?.name}</h1>
                            <p className="text-sm text-gray-500">{product?.description}</p>
                            {product?.placeholderSig && (
                                <p className="text-sm text-gray-600 mt-1">Placeholder Sig: {product.placeholderSig}</p>
                            )}
                        </div>
                        {product && getStatusBadge(product.active)}
                    </div>

                    {/* Success/Error Messages */}
                    {error && (
                        <div className={`mb-6 p-4 border rounded-lg ${error.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <p className={error.includes('✅') ? 'text-green-700' : 'text-red-700'}>{error}</p>
                        </div>
                    )}

                    {/* PRIORITY 1: Pricing & Configuration */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Pricing & Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Pricing Section */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Pharmacy Cost */}
                                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                        <div className="text-xs text-blue-600 font-medium mb-1">Pharmacy Wholesale Cost</div>
                                        <div className="text-xs text-blue-500 mb-2">What you pay</div>
                                        <div className="text-3xl font-bold text-blue-900">
                                            {product?.pharmacyWholesaleCost ? formatPrice(product.pharmacyWholesaleCost) : 'Not set'}
                                        </div>
                                    </div>

                                    {/* Retail Price */}
                                    {tenantProduct ? (
                                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="text-xs text-green-600 font-medium">Your Retail Price</div>
                                                {!editingPrice && (
                                                    <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => {
                                                        setEditingPrice(true)
                                                        setNewPrice(tenantProduct.price.toString())
                                                    }}>
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="text-xs text-green-500 mb-2">What customers pay</div>

                                            {editingPrice ? (
                                                <div>
                                                    <div className="flex gap-2 mb-2">
                                                        <div className="relative flex-1">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-500">$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={newPrice}
                                                                onChange={(e) => setNewPrice(e.target.value)}
                                                                className="w-full pl-8 pr-3 py-2 text-2xl font-bold border-2 border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                    {product?.pharmacyWholesaleCost && (
                                                        <div className="text-xs text-green-700 mt-2">
                                                            {(() => {
                                                                const price = parseFloat(newPrice) || 0
                                                                const cost = product?.pharmacyWholesaleCost || 0
                                                                const profit = price - cost
                                                                const margin = price > 0 ? ((profit / price) * 100) : 0
                                                                return `Profit: ${formatPrice(profit)} (${margin.toFixed(1)}% margin)`
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-3xl font-bold text-green-900">
                                                        {formatPrice(tenantProduct.price)}
                                                    </div>
                                                    {product?.pharmacyWholesaleCost && (
                                                        <div className="text-xs text-green-700 mt-2">
                                                            {(() => {
                                                                const price = tenantProduct.price
                                                                const cost = product?.pharmacyWholesaleCost || 0
                                                                const profit = price - cost
                                                                const margin = price > 0 ? ((profit / price) * 100) : 0
                                                                return `Profit: ${formatPrice(profit)} per unit (${margin.toFixed(1)}% margin)`
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                            <p className="text-sm text-gray-600 text-center">
                                                Enable this product to set custom pricing
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Forms Section */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Product Forms</h3>
                                {templates.length === 0 ? (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                                        <p className="text-sm text-gray-600">No forms available for this product</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {templates.map(t => {
                                            const isEnabled = enabledForms.some((f: any) => f?.questionnaireId === t.id)
                                            return (
                                                <div key={t.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{t.title}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{t.formTemplateType || 'Standard Form'}</div>
                                                        </div>
                                                        {isEnabled ? (
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                                                    <CheckCircle className="h-3 w-3 mr-1" /> Enabled
                                                                </Badge>
                                                                <Button size="sm" variant="outline" onClick={() => disableTemplate(t.id)}>
                                                                    Disable
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" onClick={() => enableTemplate(t.id)} disabled={enablingId === t.id}>
                                                                {enablingId === t.id ? 'Enabling...' : 'Enable for Clinic'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* PRIORITY 2: Product Statistics */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Product Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                {/* Total Orders */}
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                                        <span className="text-xs font-medium text-purple-600 uppercase">Total Orders</span>
                                    </div>
                                    <div className="text-3xl font-bold text-purple-900">{productStats.totalOrders}</div>
                                    <p className="text-xs text-purple-600 mt-1">All-time orders for this product</p>
                                </div>

                                {/* Active Subscribers */}
                                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-4 w-4 text-indigo-600" />
                                        <span className="text-xs font-medium text-indigo-600 uppercase">Active Subscribers</span>
                                    </div>
                                    <div className="text-3xl font-bold text-indigo-900">{productStats.activeSubscribers}</div>
                                    <p className="text-xs text-indigo-600 mt-1">Customers with active subscriptions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Product Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Pharmacy Product ID:</span>
                                    <p className="font-medium text-gray-900">{product?.pharmacyProductId || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Default Dosage:</span>
                                    <p className="font-medium text-gray-900">{product?.placeholderSig || 'N/A'}</p>
                                </div>
                                {product?.activeIngredients && product.activeIngredients.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Active Ingredients:</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {product?.activeIngredients.map((ing, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{ing}</Badge>
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

