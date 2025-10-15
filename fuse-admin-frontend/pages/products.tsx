import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    Package,
    Plus,
    Edit,
    Eye,
    DollarSign,
    Activity,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ImageIcon,
    Trash2
} from 'lucide-react'

interface Product {
    id: string
    name: string
    price: number
    pharmacyProductId?: string
    dosage?: string
    imageUrl?: string | null
    clinicId?: string
    active: boolean
    createdAt: string
    updatedAt: string
    treatments?: Array<{
        id: string
        name: string
    }>
}

interface SubscriptionInfo {
    id: string
    status: string
    plan?: { name: string; price: number; type: string; maxProducts?: number }
    nextBillingDate?: string | null
    lastProductChangeAt?: string | null
    productsChangedAmountOnCurrentCycle?: number
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([])
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [activeTab, setActiveTab] = useState<'my' | 'select'>(() => {
        const tab = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null)
        return tab === 'select' ? 'select' : 'my'
    })
    const [assignments, setAssignments] = useState<Array<{ productId: string; questionnaireId: string }>>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { user, token } = useAuth()
    const router = useRouter()

    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
    const [tenantProductCount, setTenantProductCount] = useState<number>(0)
    const [enabledProductIds, setEnabledProductIds] = useState<Set<string>>(new Set())
    const [clinicName, setClinicName] = useState<string>("")

    // Cast user to include clinicId property
    const userWithClinic = user as any

    const fetchProducts = useCallback(async () => {
        console.log('🔍 🔄 STARTING PRODUCTS FETCH PROCESS')
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
            setError('❌ Clinic Access Required: Your account is not assigned to any clinic. Please contact support to get access to clinic data.')
            setLoading(false)
            return
        }

        console.log('✅ Authentication passed, proceeding with fetch')
        console.log('🔍 🚀 STARTING ACTUAL PRODUCTS FETCH')
        console.log('🔍 Target clinic ID:', userWithClinic.clinicId)

        try {
            // Fetch products for the clinic with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
                console.log('⏰ Request timed out after 30 seconds')
                controller.abort()
            }, 30000) // 30 second timeout

            console.log('🔍 Making fetch request...')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/by-clinic/${userWithClinic.clinicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            })
            clearTimeout(timeoutId)

            console.log('🔍 📡 Response received!')
            console.log('🔍 Response status:', response.status)

            if (response.ok) {
                console.log('✅ Response OK, parsing JSON...')
                const data = await response.json()
                console.log('🔍 ✅ Response data received:', data)

                if (data.success) {
                    console.log('✅ API call successful!')
                    const items: Product[] = data.data || []
                    console.log('🔍 Products count:', items.length)
                    setAllProducts(items)
                    // My Products are derived from TenantProductForm assignments; will be set after assignments load

                    if (items.length === 0) {
                        console.log('ℹ️ No products found for this clinic - checking user state...')
                        console.log('🔍 User clinicId:', (user as any)?.clinicId)
                        console.log('🔍 User role:', (user as any)?.role)
                        setError(`No products found for your clinic. Please check your clinic assignment.`)
                    } else {
                        console.log('✅ Products loaded successfully:', items.length, 'products')
                    }
                } else {
                    console.error('❌ API returned success=false:', data.message)
                    setError(data.message || 'Failed to load products')
                }
            } else {
                const errorText = await response.text()
                console.error('❌ HTTP error response:', response.status, response.statusText)
                console.error('❌ Error body:', errorText)
                setError(`Failed to load products: ${response.status} ${response.statusText}`)
            }

        } catch (err) {
            console.error('❌ Exception during fetch:', err)
            if (err instanceof Error && err.name === 'AbortError') {
                console.error('⏰ Request was aborted due to timeout')
                setError('Request timed out. Please try again.')
            } else {
                console.error('❌ Other error type:', err)
                setError('Failed to load products')
            }
        } finally {
            console.log('🔍 Setting loading to false')
            setLoading(false)
        }
    }, [token, userWithClinic?.clinicId])

    const fetchAssignments = useCallback(async () => {
        try {
            if (!token) return
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/questionnaires/templates/assignments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) return
            const data = await res.json().catch(() => null)
            const rows = Array.isArray(data?.data) ? data.data : []
            setAssignments(rows)
            // Build My Products from assignments
            const productIds = new Set(rows.map((r: any) => r.productId).filter(Boolean))
            const my = allProducts.filter(p => productIds.has(p.id))
            setProducts(my)
        } catch (e) {
            console.warn('Failed to load assignments', e)
        }
    }, [token, allProducts])

    const fetchSubscription = useCallback(async () => {
        if (!token) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/current`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) return
            const data = await res.json().catch(() => null)
            setSubscription(data || null)
        } catch { }
    }, [token])

    const fetchTenantProductCount = useCallback(async () => {
        if (!token) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) return
            const data = await res.json().catch(() => null)
            const rows = Array.isArray(data?.data) ? data.data : []
            setTenantProductCount(rows.length)
            setEnabledProductIds(new Set(rows.map((r: any) => r.productId).filter(Boolean)))
        } catch { }
    }, [token])

    const fetchClinicName = useCallback(async () => {
        if (!token || !userWithClinic?.clinicId) return
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clinic/${userWithClinic.clinicId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) return
            const data = await res.json().catch(() => null)
            const name = data?.data?.name
            if (typeof name === 'string') setClinicName(name)
        } catch { }
    }, [token, userWithClinic?.clinicId])

    useEffect(() => {
        console.log('🔍 Products useEffect running')
        fetchProducts()
    }, [fetchProducts])

    useEffect(() => {
        // After products are loaded, fetch assignments and build My Products
        fetchAssignments()
        fetchSubscription()
        fetchTenantProductCount()
        fetchClinicName()
    }, [fetchAssignments, allProducts, fetchSubscription, fetchTenantProductCount, fetchClinicName])

    // React to query param changes to set the tab (e.g., after enabling redirect)
    useEffect(() => {
        const tab = router.query.tab
        if (tab === 'select' || tab === 'my') {
            setActiveTab(tab as 'my' | 'select')
        }
    }, [router.query.tab])

    // When switching to Select tab, refresh enabled set and counts
    useEffect(() => {
        if (activeTab === 'select') {
            fetchTenantProductCount()
        }
    }, [activeTab, fetchTenantProductCount])

    const getStatusBadge = (active: boolean) => {
        return active
            ? <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
            : <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" /> Inactive</Badge>
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    console.log('✅ Product deleted successfully')
                    // Refresh the products list
                    fetchProducts()
                } else {
                    setError(data.message || 'Failed to delete product')
                }
            } else {
                const errorText = await response.text()
                setError(`Failed to delete product: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error deleting product:', err)
            setError('Failed to delete product')
        }
    }

    const visibleProducts = activeTab === 'my' ? products : allProducts
    const displayedProducts = activeTab === 'select'
        ? [...visibleProducts].sort((a, b) => {
            const aEnabled = enabledProductIds.has(a.id)
            const bEnabled = enabledProductIds.has(b.id)
            if (aEnabled === bEnabled) return a.name.localeCompare(b.name)
            return aEnabled ? -1 : 1
        })
        : visibleProducts

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading products...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>Products - Fuse Admin</title>
                <meta name="description" content="Manage your clinic products" />
            </Head>

            <div className="min-h-screen bg-background p-6">
                {/* Debug Panel */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">🔍 Debug Panel</h3>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                console.log('🔍 Manual trigger of fetchProducts')
                                fetchProducts()
                            }}
                        >
                            🔄 Reload Products
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
                                    alert(`❌ Clinic ID Issue\n\nCurrent Clinic ID: ${clinicId}\nUser Role: ${(user as any)?.role}\n\n💡 Solutions:\n1. Log out and back in\n2. Clear browser cache\n3. Check if SQL update worked\n4. Contact support if persists`)
                                } else {
                                    alert(`✅ Clinic Access\n\nClinic ID: ${clinicId}\nUser Role: ${(user as any)?.role}\nLoading: ${loading}\nError: ${error || 'none'}`)
                                }
                            }}
                        >
                            📊 Show State
                        </Button>
                    </div>
                </div>

                {/* Subscription/product limit summary */}
                <div className="mb-6 p-4 rounded-lg border bg-muted/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Product Slots</div>
                            <div className="text-xl font-semibold">
                                {subscription?.productsChangedAmountOnCurrentCycle ?? tenantProductCount}
                                <span className="text-muted-foreground"> / </span>
                                {subscription?.plan?.maxProducts === -1 || subscription?.plan?.maxProducts === undefined ? 'Unlimited' : subscription?.plan?.maxProducts}
                            </div>
                        </div>
                        {(() => {
                            const max = subscription?.plan?.maxProducts
                            const isUnlimited = max === -1 || max === undefined
                            const used = subscription?.productsChangedAmountOnCurrentCycle ?? tenantProductCount
                            const reached = !isUnlimited && used >= (max as number)
                            if (!reached) return null
                            return (
                                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                    You have reached your product slots limit ({used}/{max}). Upgrade your plan to add more products.
                                </div>
                            )
                        })()}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
                            <p className="text-muted-foreground">Manage and monitor your clinic's product catalog</p>
                        </div>
                        <Button
                            onClick={() => router.push('/products/new')}
                            disabled={!userWithClinic?.clinicId}
                            title={!userWithClinic?.clinicId ? 'You need to be assigned to a clinic to add products' : 'Add new product'}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b">
                        <div className="flex gap-6">
                            <button
                                className={`py-2 border-b-2 ${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => setActiveTab('my')}
                            >
                                My Products
                            </button>
                            <button
                                className={`py-2 border-b-2 ${activeTab === 'select' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => setActiveTab('select')}
                            >
                                Select Products
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-red-700">{error}</p>
                                    {(error.includes('Clinic Access Required') || error.includes('No products found')) && (
                                        <div className="mt-2 text-sm text-red-600">
                                            <p className="font-medium">🔧 Troubleshooting Steps:</p>
                                            <ol className="list-decimal list-inside mt-1">
                                                <li>Use the "📊 Show State" button above to check your clinic assignment</li>
                                                <li>Try logging out and back in to refresh your session</li>
                                                <li>Clear your browser cache and cookies</li>
                                                <li>Check the browser console for detailed debug information</li>
                                                <li>Contact support if the issue persists</li>
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    {(activeTab === 'select' ? displayedProducts : visibleProducts).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(activeTab === 'select' ? displayedProducts : visibleProducts).map((product) => {
                                const isEnabled = enabledProductIds.has(product.id)
                                return (
                                    <Card key={product.id} className={`hover:shadow-lg transition-shadow ${activeTab === 'select' && isEnabled ? 'bg-green-50 border-green-200' : ''}`}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="w-12 h-12 rounded-lg object-cover border"
                                                                onLoad={(e) => {
                                                                    console.log('✅ Image loaded successfully:', product.imageUrl);
                                                                }}
                                                                onError={(e) => {
                                                                    console.log('❌ Image failed to load:', product.imageUrl, e);
                                                                    // Fallback to icon if image fails to load
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const parent = target.parentElement;
                                                                    if (parent && !parent.querySelector('.fallback-icon')) {
                                                                        const icon = document.createElement('div');
                                                                        icon.className = 'p-2 bg-primary/10 rounded-lg fallback-icon';
                                                                        icon.innerHTML = '<svg class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                                                        parent.appendChild(icon);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                                <Package className="h-6 w-6 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                                        <p className="text-sm text-muted-foreground">
                                                            {product.pharmacyProductId && `Pharmacy ID: ${product.pharmacyProductId}`}
                                                        </p>
                                                        {activeTab === 'select' && isEnabled && clinicName && (
                                                            <p className="text-xs text-green-700 mt-1">Enabled for {clinicName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {getStatusBadge(product.active)}
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-4">
                                                {/* Price Information */}
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Price</span>
                                                    </div>
                                                    <span className="font-semibold">{formatPrice(product.price)}</span>
                                                </div>

                                                {/* Dosage Information */}
                                                {product.dosage && (
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Default Dosage</span>
                                                        </div>
                                                        <span className="font-semibold">{product.dosage}</span>
                                                    </div>
                                                )}

                                                {/* Treatments Count */}
                                                {product.treatments && product.treatments.length > 0 && (
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Used in</span>
                                                        </div>
                                                        <span className="font-semibold">{product.treatments.length} treatment{(product.treatments.length > 1) ? 's' : ''}</span>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => router.push(`/products/${product.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => router.push(`/products/${product.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Package className="h-12 w-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                                    <p className="text-muted-foreground mb-4">Get started by creating your first product.</p>
                                    <Button onClick={() => router.push('/products/new')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Product
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
