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
    ShoppingCart,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    DollarSign,
    Package,
    User,
    Calendar,
    MapPin,
    CreditCard
} from 'lucide-react'

interface OrderItem {
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    dosage?: string
    notes?: string
    pharmacyProductId?: string
    product: {
        id: string
        name: string
        pharmacyProductId?: string
        dosage?: string
    }
}

interface Order {
    id: string
    orderNumber: string
    status: 'pending' | 'payment_processing' | 'paid' | 'payment_due' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    subtotalAmount: number
    discountAmount: number
    taxAmount: number
    shippingAmount: number
    totalAmount: number
    notes?: string
    questionnaireAnswers?: Record<string, any>
    shippedAt?: string
    deliveredAt?: string
    paymentIntentId?: string
    createdAt: string
    user: {
        id: string
        firstName: string
        lastName: string
        email: string
        phoneNumber?: string
    }
    treatment: {
        id: string
        name: string
    }
    orderItems: OrderItem[]
    shippingAddress: {
        id: string
        address: string
        apartment?: string
        city: string
        state: string
        zipCode: string
        country: string
    }
    physician?: {
        id: string
        firstName: string
        lastName: string
        pharmacyPhysicianId?: string
    }
    treatmentPlan?: {
        id: string
        name: string
        stripePriceId?: string
    }
    questionnaire?: {
        id: string
        title: string
    }
}

export default function OrderDetail() {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user, token } = useAuth()
    const router = useRouter()
    const { id } = router.query

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token || !id) return

            try {
                setLoading(true)
                console.log('🔍 Fetching order:', id)

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                console.log('🔍 Response status:', response.status)

                if (response.ok) {
                    const data = await response.json()
                    console.log('🔍 Order data:', data)

                    if (data.success) {
                        setOrder(data.data)
                    } else {
                        setError(data.message || 'Failed to load order')
                    }
                } else {
                    const errorText = await response.text()
                    console.error('❌ Error response:', errorText)
                    setError(`Failed to load order: ${response.status} ${response.statusText}`)
                }

            } catch (err) {
                console.error('Error fetching order:', err)
                if (err instanceof Error && err.name === 'AbortError') {
                    setError('Request timed out. Please try again.')
                } else {
                    setError('Failed to load order')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [token, id])

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
                        <p className="text-muted-foreground">Loading order details...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !order) {
        return (
            <Layout>
                <div className="min-h-screen bg-background p-6">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            variant="outline"
                            onClick={() => router.push('/orders')}
                            className="mb-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Orders
                        </Button>

                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <XCircle className="h-12 w-12 text-red-500" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h3>
                                    <p className="text-muted-foreground mb-4">{error || 'The requested order could not be found.'}</p>
                                    <Button onClick={() => router.push('/orders')}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Orders
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
                <title>Order {order.orderNumber} - Fuse Admin</title>
                <meta name="description" content={`Order details for ${order.orderNumber}`} />
            </Head>

            <div className="min-h-screen bg-background p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/orders')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Orders
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Order {order.orderNumber}</h1>
                                <p className="text-muted-foreground">Detailed order information and status</p>
                            </div>
                        </div>
                        {getStatusBadge(order.status)}
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
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {order.user ? (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Name:</span>
                                                    <span className="font-semibold">
                                                        {order.user.firstName || 'N/A'} {order.user.lastName || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Email:</span>
                                                    <span className="font-semibold">{order.user.email || 'N/A'}</span>
                                                </div>
                                                {order.user.phoneNumber && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Phone:</span>
                                                        <span className="font-semibold">{order.user.phoneNumber}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                Customer information not available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Treatment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Treatment Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Treatment:</span>
                                            <span className="font-semibold">{order.treatment?.name || 'N/A'}</span>
                                        </div>
                                        {order.treatmentPlan && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Plan:</span>
                                                <span className="font-semibold">{order.treatmentPlan.name || 'N/A'}</span>
                                            </div>
                                        )}
                                        {order.physician && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Physician:</span>
                                                <span className="font-semibold">
                                                    {order.physician.firstName || 'N/A'} {order.physician.lastName || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Order Items ({(order.orderItems || []).length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(order.orderItems || []).length > 0 ? (
                                            (order.orderItems || []).map((item) => (
                                                <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{item.product?.name || 'N/A'}</h4>
                                                        {item.dosage && (
                                                            <p className="text-sm text-muted-foreground">Dosage: {item.dosage}</p>
                                                        )}
                                                        {item.notes && (
                                                            <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{formatPrice(item.totalPrice || 0)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Qty: {item.quantity || 0} × {formatPrice(item.unitPrice || 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                No items in this order
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal:</span>
                                            <span className="font-semibold">{formatPrice(order.subtotalAmount)}</span>
                                        </div>
                                        {order.discountAmount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-{formatPrice(order.discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax:</span>
                                            <span className="font-semibold">{formatPrice(order.taxAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping:</span>
                                            <span className="font-semibold">{formatPrice(order.shippingAmount)}</span>
                                        </div>
                                        <hr className="my-3" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        {order.shippingAddress ? (
                                            <>
                                                <p className="font-semibold">{order.shippingAddress.address || 'N/A'}</p>
                                                {order.shippingAddress.apartment && (
                                                    <p className="text-muted-foreground">{order.shippingAddress.apartment}</p>
                                                )}
                                                <p className="text-muted-foreground">
                                                    {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || 'N/A'}
                                                </p>
                                                <p className="text-muted-foreground">{order.shippingAddress.country || 'N/A'}</p>
                                            </>
                                        ) : (
                                            <div className="text-center text-muted-foreground">
                                                No shipping address available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Order Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Created:</span>
                                            <span className="font-semibold">{formatDate(order.createdAt)}</span>
                                        </div>
                                        {order.shippedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Shipped:</span>
                                                <span className="font-semibold">{formatDate(order.shippedAt)}</span>
                                            </div>
                                        )}
                                        {order.deliveredAt && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Delivered:</span>
                                                <span className="font-semibold">{formatDate(order.deliveredAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Notes */}
                            {order.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{order.notes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
