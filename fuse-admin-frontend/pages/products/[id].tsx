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
    Package,
    Eye,
    CheckCircle,
    XCircle,
    DollarSign,
    Activity,
    Building2,
    Calendar,
    ImageIcon,
    Edit,
    Pill,
    FileText,
    Hash,
    Trash2
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
    treatments?: Array<{
        id: string
        name: string
    }>
}

export default function ProductDetail() {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, token } = useAuth()
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        const fetchProduct = async () => {
            if (!token || !id) return

            try {
                setLoading(true)
                console.log('🔍 Fetching product:', id)

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                console.log('🔍 Response status:', response.status)

                if (response.ok) {
                    const data = await response.json()
                    console.log('🔍 Product data:', data)

                    if (data.success) {
                        setProduct(data.data)
                    } else {
                        setError(data.message || 'Failed to load product')
                    }
                } else {
                    const errorText = await response.text()
                    console.error('❌ Error response:', errorText)
                    setError(`Failed to load product: ${response.status} ${response.statusText}`)
                }

            } catch (err) {
                console.error('Error fetching product:', err)
                if (err instanceof Error && err.name === 'AbortError') {
                    setError('Request timed out. Please try again.')
                } else {
                    setError('Failed to load product')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
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

    const handleDeleteProduct = async () => {
        if (!product || !token) return

        if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone and will also delete the associated image if it exists.`)) {
            return
        }

        try {
            console.log('🔍 Deleting product:', product.id)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${product.id}`, {
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
                    router.push('/products')
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

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading product details...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !product) {
        return (
            <Layout>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/products')}
                            className="mb-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Products
                        </Button>

                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <XCircle className="h-12 w-12 text-red-500" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
                                    <p className="text-muted-foreground mb-4">{error || 'The requested product could not be found.'}</p>
                                    <Button onClick={() => router.push('/products')}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Products
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
                <title>{product?.name || 'Product'} - Fuse Admin</title>
                <meta name="description" content={`Product details for ${product?.name || 'Unknown Product'}`} />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/products')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Products
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">{product?.name || 'Unknown Product'}</h1>
                                <p className="text-muted-foreground">Detailed product information and associated treatments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(product.active)}
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/products/${product.id}/edit`)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Product
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDeleteProduct}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                            </Button>
                        </div>
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
                        {/* Product Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Product Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Product Image */}
                                        {product?.imageUrl && (
                                            <div className="mb-4">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product?.name || 'Product'}
                                                    className="w-full max-w-md h-48 object-cover rounded-lg shadow-md"
                                                />
                                            </div>
                                        )}

                                        {/* Basic Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-muted-foreground">Product Name:</span>
                                                <p className="font-semibold">{product?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Status:</span>
                                                <div className="mt-1">{getStatusBadge(product.active)}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Price:</span>
                                                <p className="font-semibold">{formatPrice(product.price)}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <p className="font-semibold">{formatDate(product.createdAt)}</p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {product?.description && (
                                            <div>
                                                <span className="text-muted-foreground">Description:</span>
                                                <p className="font-semibold mt-1">{product.description}</p>
                                            </div>
                                        )}

                                        {/* Active Ingredients */}
                                        {product?.activeIngredients && product.activeIngredients.length > 0 && (
                                            <div>
                                                <span className="text-muted-foreground">Active Ingredients:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {product.activeIngredients.map((ingredient, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            <Pill className="h-3 w-3 mr-1" />
                                                            {ingredient}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Associated Treatments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Used in Treatments ({(product?.treatments || []).length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(product?.treatments || []).length > 0 ? (
                                            (product?.treatments || []).map((treatment) => (
                                                <div key={treatment.id} className="flex justify-between items-start p-4 border rounded-lg">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{treatment.name || 'N/A'}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Treatment ID: {treatment.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                This product is not associated with any treatments
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Product Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price:</span>
                                            <span className="font-semibold">{formatPrice(product.price)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pharmacy ID:</span>
                                            <span className="font-semibold">{product.pharmacyProductId || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Default Dosage:</span>
                                            <span className="font-semibold">{product.dosage || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Updated:</span>
                                            <span className="font-semibold">{formatDate(product?.updatedAt)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Statistics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Statistics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Associated Treatments:</span>
                                            <span className="font-semibold">{(product?.treatments || []).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Active Ingredients:</span>
                                            <span className="font-semibold">{(product?.activeIngredients || []).length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Has Image:</span>
                                            <span className="font-semibold">{product.imageUrl ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Product ID:</span>
                                            <span className="font-semibold text-xs">{product.id}</span>
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
