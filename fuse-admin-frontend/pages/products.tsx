import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import Tutorial from '@/components/ui/tutorial'
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
    Trash2,
    ChevronRight,
    Filter,
    X
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
    category?: string
    createdAt: string
    updatedAt: string
    treatments?: Array<{
        id: string
        name: string
    }>
}

const PRODUCT_CATEGORIES = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'hair_growth', label: 'Hair Growth' },
    { value: 'performance', label: 'Performance' },
    { value: 'sexual_health', label: 'Sexual Health' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'other', label: 'Other' },
]

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
    const [runTutorial, setRunTutorial] = useState(() => {
        // Check if tutorial has been completed before
        if (typeof window !== 'undefined') {
            const tutorialCompleted = localStorage.getItem('tutorialCompleted');
            return tutorialCompleted !== 'true';
        }
        return false;
    })
    const { user, token } = useAuth()
    const router = useRouter()

    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
    const [tenantProductCount, setTenantProductCount] = useState<number>(0)
    const [enabledProductIds, setEnabledProductIds] = useState<Set<string>>(new Set())
    const [tenantProducts, setTenantProducts] = useState<Array<{ id: string; productId: string }>>([])
    const [clinicName, setClinicName] = useState<string>("")
    const [retryLoading, setRetryLoading] = useState<boolean>(false)
    const [bannerMessage, setBannerMessage] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    // Cast user to include clinicId property
    const userWithClinic = user as any

    const fetchProducts = useCallback(async () => {
        console.log('🔍 🔄 STARTING PRODUCTS FETCH PROCESS (ALL PRODUCTS)')
        console.log('🔍 User data:', user)
        console.log('🔍 Token present:', !!token)

        setLoading(true)
        setError(null)

        if (!token) {
            console.log('❌ No token available, skipping fetch')
            setError('No authentication token found')
            setLoading(false)
            return
        }

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
                console.log('⏰ Request timed out after 30 seconds')
                controller.abort()
            }, 30000)

            // Fetch ALL products with pagination from products-management
            const baseParams = new URLSearchParams()
            baseParams.append('page', '1')
            baseParams.append('limit', '100')
            // Show active products by default
            baseParams.append('isActive', 'true')

            console.log('🔍 Fetching first page of products-management...')
            const firstRes = await fetch(`${baseUrl}/products-management?${baseParams.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            })
            const firstJson = await firstRes.json().catch(() => null)
            if (!firstRes.ok || !firstJson) {
                clearTimeout(timeoutId)
                throw new Error(firstJson?.message || 'Failed to load products')
            }

            const firstPageProducts: Product[] = firstJson?.data?.products || []
            const totalPages: number = firstJson?.data?.pagination?.totalPages || 1

            let combined = [...firstPageProducts]
            if (totalPages > 1) {
                const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
                console.log('🔍 Fetching remaining pages:', pageNumbers)
                const pageRequests = pageNumbers.map((page) => {
                    const params = new URLSearchParams(baseParams.toString())
                    params.set('page', String(page))
                    return fetch(`${baseUrl}/products-management?${params.toString()}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(r => r.json()).catch(() => null)
                })
                const pages = await Promise.all(pageRequests)
                const rest: Product[] = pages.flatMap(p => (p?.data?.products || []))
                combined = [...combined, ...rest]
            }

            clearTimeout(timeoutId)
            console.log('✅ Loaded products (combined):', combined.length)
            setAllProducts(combined)
        } catch (err: any) {
            console.error('❌ Failed to load products:', err)
            setError(err?.message || 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }, [token])

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
        } catch (e) {
            console.warn('Failed to load assignments', e)
        }
    }, [token])

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
            setTenantProducts(rows.map((r: any) => ({ id: r.id, productId: r.productId })))
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

    // Build My Products from TenantProduct mappings (enabledProductIds)
    useEffect(() => {
        const my = allProducts.filter(p => enabledProductIds.has(p.id))
        setProducts(my)
    }, [allProducts, enabledProductIds])

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

    const getCategoryBadgeColors = (category?: string) => {
        switch (category) {
            case 'weight_loss':
                return 'bg-orange-50 text-orange-700 border-orange-200'
            case 'hair_growth':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'performance':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'sexual_health':
                return 'bg-pink-50 text-pink-700 border-pink-200'
            case 'skincare':
                return 'bg-teal-50 text-teal-700 border-teal-200'
            case 'wellness':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'other':
                return 'bg-gray-50 text-gray-700 border-gray-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const handleDisableProduct = async (productId: string, productName: string) => {
        if (!confirm(`Disable "${productName}"? You can re-enable it anytime from Select Products.`)) {
            return
        }

        try {
            // Find the tenant product ID for this product
            const tenantProduct = tenantProducts.find(tp => tp.productId === productId)
            
            if (!tenantProduct) {
                setError('Product not found in My Products')
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products/${tenantProduct.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    console.log('✅ Product disabled successfully')
                    // Refresh the tenant products list
                    fetchTenantProductCount()
                } else {
                    setError(data.message || 'Failed to disable product')
                }
            } else {
                const errorText = await response.text()
                setError(`Failed to disable product: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error disabling product:', err)
            setError('Failed to disable product')
        }
    }

    const handleEnableProduct = async (productId: string, productName: string) => {
        try {
            // Check subscription limits
            const max = subscription?.plan?.maxProducts
            const isUnlimited = max === -1 || max === undefined
            const used = subscription?.productsChangedAmountOnCurrentCycle ?? tenantProductCount
            
            if (!isUnlimited && used >= (max as number)) {
                setError(`Product limit reached (${max}). Please upgrade your plan to enable more products.`)
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tenant-products/update-selection`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    products: [{ productId }]
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    console.log('✅ Product enabled successfully')
                    // Refresh the tenant products list
                    fetchTenantProductCount()
                } else {
                    setError(data.message || 'Failed to enable product')
                }
            } else {
                const errorText = await response.text()
                setError(`Failed to enable product: ${response.status} ${response.statusText}`)
            }
        } catch (err) {
            console.error('Error enabling product:', err)
            setError('Failed to enable product')
        }
    }

    const visibleProducts = activeTab === 'my' ? products : allProducts
    
    // Apply category filter (case-insensitive)
    const filteredProducts = selectedCategory 
        ? visibleProducts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase())
        : visibleProducts
    
    // For Select tab, sort enabled products first
    const displayedProducts = activeTab === 'select'
        ? [...filteredProducts].sort((a, b) => {
            const aEnabled = enabledProductIds.has(a.id)
            const bEnabled = enabledProductIds.has(b.id)
            if (aEnabled === bEnabled) return a.name.localeCompare(b.name)
            return aEnabled ? -1 : 1
        })
        : filteredProducts

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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
            </Head>
            <Tutorial runTutorial={runTutorial} setRunTutorial={setRunTutorial} />
            <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Products</h1>
                            <p className="text-sm text-gray-500">Enable or disable products for your clinic</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-sm font-medium"
                                onClick={() => {
                                    console.log('🔍 Manual trigger of fetchProducts')
                                    fetchProducts()
                                }}
                            >
                                <Package className="h-4 w-4 mr-1.5" />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Subscription/product limit summary - Compact */}
                    <div className="mb-6 px-4 py-3 rounded-lg border border-gray-200 bg-white">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">Product Slots:</span>
                                <span className="font-medium text-gray-900">
                                    {subscription?.productsChangedAmountOnCurrentCycle ?? tenantProductCount} / {subscription?.plan?.maxProducts === -1 || subscription?.plan?.maxProducts === undefined ? 'Unlimited' : subscription?.plan?.maxProducts}
                                </span>
                            </div>
                            {(() => {
                                const max = subscription?.plan?.maxProducts
                                const isUnlimited = max === -1 || max === undefined
                                const used = subscription?.productsChangedAmountOnCurrentCycle ?? tenantProductCount
                                const reached = !isUnlimited && used >= (max as number)
                                if (!reached) return null
                                return (
                                    <div className="text-sm text-amber-700">
                                        Limit reached. <a href="/plans" className="underline">Upgrade plan</a>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <div className="flex gap-8">
                            <button
                                className={`pb-3 border-b-2 transition-colors text-sm font-medium ${activeTab === 'my' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('my')}
                            >
                                My Products
                            </button>
                            <button
                                className={`pb-3 border-b-2 transition-colors text-sm font-medium ${activeTab === 'select' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('select')}
                            >
                                Select Products
                            </button>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Filter className="h-4 w-4" />
                                <span className="font-medium">Filter:</span>
                            </div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === null 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            {PRODUCT_CATEGORIES.map((category) => (
                                <button
                                    key={category.value}
                                    onClick={() => setSelectedCategory(category.value)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                        selectedCategory === category.value 
                                            ? 'bg-indigo-600 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="ml-2 p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="Clear filter"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                            <div className="flex">
                                <XCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products List */}
                    {displayedProducts.length > 0 ? (
                        <>
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {displayedProducts.map((product, index) => {
                                    const isEnabled = enabledProductIds.has(product.id)
                                    return (
                                        <div 
                                            key={product.id} 
                                            className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${index !== 0 ? 'border-t border-gray-100' : ''}`}
                                            onClick={() => router.push(`/products/${product.id}`)}
                                        >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Avatar/Image */}
                                            <div className="flex-shrink-0">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent && !parent.querySelector('.fallback-icon')) {
                                                                const icon = document.createElement('div');
                                                                icon.className = 'w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center fallback-icon';
                                                                icon.innerHTML = '<svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                                                parent.appendChild(icon);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name & Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {product.dosage || 'No dosage specified'}
                                                </p>
                                            </div>

                                            {/* Category Badge */}
                                            <div className="flex-shrink-0">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeColors(product.category)}`}>
                                                    {product.category ? PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category : 'General'}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            <div className="flex-shrink-0 w-24 text-right">
                                                <span className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex-shrink-0 flex items-center gap-2 group">
                                                {isEnabled ? (
                                                    // Product is enabled - Show Enabled badge, changes to Remove text on hover
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDisableProduct(product.id, product.name);
                                                        }}
                                                        className="relative transition-all duration-300 ease-in-out"
                                                        title="Click to disable"
                                                    >
                                                        {/* Enabled badge (default state) */}
                                                        <div className="group-hover:opacity-0 transition-all duration-300 ease-in-out">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                                Enabled
                                                            </span>
                                                        </div>
                                                        {/* Remove text (hover state) */}
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 ease-in-out">
                                                            <span className="text-sm font-medium text-red-600 whitespace-nowrap">Remove</span>
                                                        </div>
                                                    </button>
                                                ) : (
                                                    // Product is not enabled - Show Activate button
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEnableProduct(product.id, product.name);
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    className="p-2 transition-all duration-300 ease-in-out group-hover:translate-x-4"
                                                >
                                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {/* Add More Products Button - Only show on My Products tab */}
                        {activeTab === 'my' && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="default"
                                    className="w-full h-12 text-sm font-medium border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                                    onClick={() => setActiveTab('select')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add more products
                                </Button>
                            </div>
                        )}
                    </>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-1">No products found</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {activeTab === 'my' 
                                            ? 'Enable products from the "Select Products" tab to get started.' 
                                            : 'No products available. Contact your administrator.'}
                                    </p>
                                    {activeTab === 'my' && (
                                        <Button 
                                            size="sm"
                                            className="h-9 px-4 text-sm font-medium"
                                            onClick={() => setActiveTab('select')}
                                        >
                                            <Package className="h-4 w-4 mr-1.5" />
                                            Browse Products
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}
