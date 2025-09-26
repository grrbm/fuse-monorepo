import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    ShoppingCart,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    DollarSign,
    Package,
    User,
    Calendar
} from 'lucide-react'

interface Order {
    id: string
    orderNumber: string
    status: 'pending' | 'payment_processing' | 'paid' | 'payment_due' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    subtotalAmount: number
    discountAmount: number
    taxAmount: number
    shippingAmount: number
    totalAmount: number
    createdAt: string
    shippedAt?: string
    deliveredAt?: string
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
    }
    treatment: {
        id: string
        name: string
    }
    orderItems: Array<{
        id: string
        quantity: number
        unitPrice: number
        totalPrice: number
        product: {
            id: string
            name: string
        }
    }>
    shippingAddress: {
        id: string
        address: string
        city: string
        state: string
        zipCode: string
        country: string
    }
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(false)  // Start with false, set to true when fetching
    const [error, setError] = useState<string | null>(null)
    const { user, token } = useAuth()
    const router = useRouter()

    // Cast user to include clinicId property
    const userWithClinic = user as any

    console.log('🔍 Orders component mounted')
    console.log('🔍 Initial user data:', user)
    console.log('🔍 Initial token:', token)
    console.log('🔍 Initial clinic ID:', userWithClinic?.clinicId)

    const fetchOrders = useCallback(async () => {
        console.log('🔍 FetchOrders called - User data:', user)
        console.log('🔍 FetchOrders called - Token:', token)
        console.log('🔍 FetchOrders called - Clinic ID:', userWithClinic?.clinicId)

        console.log('🔍 🔄 STARTING ORDERS FETCH PROCESS')
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

        // Test basic connectivity first
        try {
            console.log('🔍 Testing basic connectivity to /auth/me...')
            const testResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('🔍 Test response status:', testResponse.status)
            if (testResponse.ok) {
                const testData = await testResponse.json()
                console.log('🔍 Test response data:', testData)
                console.log('✅ Connectivity test PASSED')
            } else {
                const errorText = await testResponse.text()
                console.error('❌ Test failed:', errorText)
                console.error('❌ Connectivity test FAILED')
            }
        } catch (testError) {
            console.error('❌ Connectivity test error:', testError)
        }

        console.log('🔍 🚀 STARTING ACTUAL ORDERS FETCH')
        console.log('🔍 Target clinic ID:', userWithClinic.clinicId)
        console.log('🔍 API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/by-clinic/${userWithClinic.clinicId}`)

        try {
            setLoading(true)
            console.log('🔍 Setting loading to true')

            // Fetch orders for the clinic with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => {
                console.log('⏰ Request timed out after 10 seconds')
                controller.abort()
            }, 10000) // 10 second timeout

            console.log('🔍 Making fetch request...')
            console.log('🔍 📡 Making API request...')
            console.log('🔍 📡 Full URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/by-clinic/${userWithClinic.clinicId}`)
            console.log('🔍 📡 Headers:', {
                'Authorization': `Bearer ${token.substring(0, 20)}...`, // Don't log full token
                'Content-Type': 'application/json'
            })

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/by-clinic/${userWithClinic.clinicId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            })
            clearTimeout(timeoutId)

            console.log('🔍 📡 Response received!')
            console.log('🔍 Response status:', response.status)
            console.log('🔍 Response statusText:', response.statusText)
            console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))

            if (response.ok) {
                console.log('✅ Response OK, parsing JSON...')
                const data = await response.json()
                console.log('🔍 ✅ Response data received:', data)

                if (data.success) {
                    console.log('✅ API call successful!')
                    const orders = data.data.orders || []
                    console.log('🔍 Orders count:', orders.length)
                    console.log('🔍 Setting orders state with:', orders.length, 'orders')

                    setOrders(orders)

                    if (orders.length === 0) {
                        console.log('ℹ️ No orders found for this clinic')
                        setError('No orders found for your clinic')
                    } else {
                        console.log('✅ Orders loaded successfully:', orders.length, 'orders')
                    }
                } else {
                    console.error('❌ API returned success=false:', data.message)
                    setError(data.message || 'Failed to load orders')
                }
            } else {
                const errorText = await response.text()
                console.error('❌ HTTP error response:', response.status, response.statusText)
                console.error('❌ Error body:', errorText)
                console.error('❌ Error body parsed:', JSON.parse(errorText) || errorText)

                // Try to parse error as JSON
                let errorDetails = errorText
                try {
                    const errorObj = JSON.parse(errorText)
                    errorDetails = errorObj.message || errorObj.error || errorText
                } catch (e) {
                    // Not JSON, use raw text
                }

                setError(`❌ API Error ${response.status}: ${errorDetails}`)
            }

        } catch (err) {
            console.error('❌ Exception during fetch:', err)
            if (err instanceof Error && err.name === 'AbortError') {
                console.error('⏰ Request was aborted due to timeout')
                setError('Request timed out. Please try again.')
            } else {
                console.error('❌ Other error type:', err)
                setError('Failed to load orders')
            }
        } finally {
            console.log('🔍 Setting loading to false')
            setLoading(false)
        }
    }, [token, userWithClinic?.clinicId])

    useEffect(() => {
        console.log('🔍 useEffect running')
        fetchOrders()
    }, [fetchOrders])

    // Debug: Check if component is working at all
    useEffect(() => {
        console.log('🔍 📄 ORDERS PAGE LOADED!')
        console.log('🔍 User object:', user)
        console.log('🔍 Token object:', token)
        console.log('🔍 User clinicId:', (user as any)?.clinicId)

        // Check after a short delay to see if auth state changes
        const timer = setTimeout(() => {
            console.log('🔍 ⏱️ After delay - User object:', user)
            console.log('🔍 ⏱️ After delay - Token object:', token)
            console.log('🔍 ⏱️ After delay - User clinicId:', (user as any)?.clinicId)

            // Test if we can trigger fetchOrders manually
            if (token && (user as any)?.clinicId) {
                console.log('🔍 ⏱️ Auto-triggering fetchOrders after delay')
                fetchOrders()
            } else {
                console.log('❌ Still no clinicId after delay - manual reload required')
                console.log('💡 Try: 1) Log out and back in, or 2) Use the Debug Panel buttons')
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
            case 'payment_processing':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Clock className="h-3 w-3 mr-1" /> Payment Processing</Badge>
            case 'paid':
                return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>
            case 'payment_due':
                return <Badge className="bg-red-100 text-red-800 border-red-300"><AlertCircle className="h-3 w-3 mr-1" /> Payment Due</Badge>
            case 'processing':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>
            case 'shipped':
                return <Badge className="bg-purple-100 text-purple-800 border-purple-300"><Package className="h-3 w-3 mr-1" /> Shipped</Badge>
            case 'delivered':
                return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 border-gray-300"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
            case 'refunded':
                return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><XCircle className="h-3 w-3 mr-1" /> Refunded</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading orders...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <Head>
                <title>Orders - Fuse Admin</title>
                <meta name="description" content="Manage and track your clinic orders" />
            </Head>

            <div className="min-h-screen bg-background p-6">
                {/* Debug Panel */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">🔍 Debug Panel</h3>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                console.log('🔍 Manual trigger of fetchOrders')
                                fetchOrders()
                            }}
                        >
                            🔄 Reload Orders
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
                            <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
                            <p className="text-muted-foreground">Track and manage patient orders</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex">
                                <XCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-red-700">{error}</p>
                                    {error.includes('Clinic Access Required') && (
                                        <div className="mt-2 text-sm text-red-600">
                                            <p className="font-medium">🔧 Troubleshooting Steps:</p>
                                            <ol className="list-decimal list-inside mt-1">
                                                <li>Try logging out and back in to refresh your session</li>
                                                <li>Clear your browser cache and cookies</li>
                                                <li>Use the "📊 Show State" button above to verify your clinic ID</li>
                                                <li>Contact support if the issue persists</li>
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    {orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <ShoppingCart className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.user?.firstName || 'N/A'} {order.user?.lastName || 'N/A'} • {order.treatment?.name || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {getStatusBadge(order.status)}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/orders/${order.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Order Details */}
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Customer</span>
                                                    </div>
                                                    <span className="font-semibold">{order.user?.firstName || 'N/A'} {order.user?.lastName || 'N/A'}</span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">Created</span>
                                                    </div>
                                                    <span className="font-semibold">{formatDate(order.createdAt)}</span>
                                                </div>

                                                {order.shippedAt && (
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Shipped</span>
                                                        </div>
                                                        <span className="font-semibold">{formatDate(order.shippedAt)}</span>
                                                    </div>
                                                )}

                                                {order.deliveredAt && (
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">Delivered</span>
                                                        </div>
                                                        <span className="font-semibold">{formatDate(order.deliveredAt)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Items */}
                                            <div className="space-y-2">
                                                <h4 className="font-semibold mb-3">Items</h4>
                                                {(order.orderItems || []).slice(0, 2).map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center py-2">
                                                        <div>
                                                            <p className="font-medium">{item.product.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                                                            </p>
                                                        </div>
                                                        <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                                                    </div>
                                                ))}
                                                {(order.orderItems || []).length > 2 && (
                                                    <p className="text-sm text-muted-foreground">
                                                        +{(order.orderItems || []).length - 2} more items
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="mt-6 pt-6 border-t">
                                            <div className="flex justify-between items-center text-lg font-semibold">
                                                <span>Total Amount</span>
                                                <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
                                    <p className="text-muted-foreground">Orders will appear here when patients place them.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    )
}
