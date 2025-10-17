import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Layout from '@/components/Layout'
import {
    ShoppingCart,
    DollarSign,
    Clock,
    TrendingUp,
    Search,
    ChevronDown,
    ChevronRight,
    Package,
    MapPin,
    CreditCard,
    Calendar,
    User
} from 'lucide-react'

interface Order {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    createdAt: string
    shippedAt?: string
    deliveredAt?: string
    user?: {
        id: string
        firstName: string
        lastName: string
        email: string
    }
    orderItems?: Array<{
        id: string
        quantity: number
        unitPrice: number
        totalPrice: number
        product: {
            id: string
            name: string
            category?: string
        }
    }>
    shippingAddress?: {
        address: string
        apartment?: string
        city: string
        state: string
        zipCode: string
        country: string
    }
    payment?: {
        status: string
        paymentMethod: string
    }
}

type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const { user, token } = useAuth()

    useEffect(() => {
        fetchOrders()
    }, [token, user])

    const fetchOrders = async () => {
        if (!token || !user) return

        try {
            setLoading(true)
            setError(null)
            const userWithClinic: any = user
            const clinicId = userWithClinic?.clinicId

            if (!clinicId) {
                setError('No clinic access. Please contact support.')
                return
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/by-clinic/${clinicId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setOrders(data.data.orders || [])
                } else {
                    setError(data.message || 'Failed to load orders')
                }
            } else {
                setError('Failed to load orders')
            }
        } catch (err) {
            setError('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    // Calculate stats
    const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'payment_due').length,
        avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0
    }

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        const matchesSearch = searchTerm === '' || 
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const toggleRow = (orderId: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId)
        } else {
            newExpanded.add(orderId)
        }
        setExpandedRows(newExpanded)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status: string) => {
        return <Badge variant="outline" className="text-xs font-medium">{status}</Badge>
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
            </Head>

            <div className="min-h-screen bg-background p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-semibold text-foreground mb-2">Orders</h1>
                        <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</p>
                                        <p className="text-2xl font-semibold text-foreground mt-1">{stats.totalOrders}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Revenue</p>
                                        <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(stats.totalRevenue)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Orders</p>
                                        <p className="text-2xl font-semibold text-foreground mt-1">{stats.pendingOrders}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Order Value</p>
                                        <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(stats.avgOrderValue)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters & Search */}
                    <div className="mb-6 space-y-4">
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by order #, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] as StatusFilter[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                        statusFilter === status
                                            ? 'bg-foreground text-background'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 border border-red-200 rounded-md bg-background">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Orders Table */}
                    <Card className="border-border shadow-sm">
                        <CardHeader className="border-b border-border">
                            <CardTitle className="text-lg font-semibold">All Orders ({filteredOrders.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredOrders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here when customers place them'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order #</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items</th>
                                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                                                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                                                <th className="w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredOrders.map((order) => {
                                                const isExpanded = expandedRows.has(order.id)
                                                return (
                                                    <>
                                                        <tr
                                                            key={order.id}
                                                            onClick={() => toggleRow(order.id)}
                                                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                                                        >
                                                            <td className="p-4">
                                                                <span className="font-medium text-foreground">{order.orderNumber}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <div>
                                                                    <div className="font-medium text-foreground">
                                                                        {order.user?.firstName} {order.user?.lastName}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="text-sm text-foreground">{formatDate(order.createdAt)}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className="text-sm text-muted-foreground">
                                                                    {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                {getStatusBadge(order.status)}
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <span className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
                                                            </td>
                                                            <td className="p-4">
                                                                {isExpanded ? (
                                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Row Details */}
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan={7} className="p-0">
                                                                    <div className="bg-muted/30 p-6 border-t border-border">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                            {/* Order Items */}
                                                                            <div>
                                                                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Order Items</h4>
                                                                                <div className="space-y-3">
                                                                                    {order.orderItems?.map((item) => (
                                                                                        <div key={item.id} className="flex justify-between items-start p-3 bg-card border border-border rounded-lg">
                                                                                            <div className="flex-1">
                                                                                                <div className="font-medium text-foreground">{item.product.name}</div>
                                                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                                                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                                                                                </div>
                                                                                                {item.product.category && (
                                                                                                    <Badge variant="outline" className="text-xs font-normal mt-1">
                                                                                                        {item.product.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="font-semibold text-foreground">
                                                                                                {formatCurrency(item.totalPrice)}
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Shipping & Payment Info */}
                                                                            <div className="space-y-4">
                                                                                {/* Shipping Address */}
                                                                                {order.shippingAddress && (
                                                                                    <div>
                                                                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Shipping Address</h4>
                                                                                        <div className="p-3 bg-card border border-border rounded-lg">
                                                                                            <div className="flex items-start gap-2">
                                                                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                                                                <div className="text-sm text-foreground">
                                                                                                    <div>{order.shippingAddress.address}</div>
                                                                                                    {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
                                                                                                    <div>
                                                                                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                                                                                    </div>
                                                                                                    <div>{order.shippingAddress.country || 'US'}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Payment Info */}
                                                                                {order.payment && (
                                                                                    <div>
                                                                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Payment</h4>
                                                                                        <div className="p-3 bg-card border border-border rounded-lg">
                                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                                                                <span className="text-foreground">
                                                                                                    {order.payment.paymentMethod || 'Card'} • {order.payment.status}
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {/* Timeline */}
                                                                                <div>
                                                                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Timeline</h4>
                                                                                    <div className="space-y-2">
                                                                                        <div className="flex items-center gap-2 text-sm">
                                                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                            <span className="text-muted-foreground">Created:</span>
                                                                                            <span className="font-medium text-foreground">{formatDate(order.createdAt)}</span>
                                                                                        </div>
                                                                                        {order.shippedAt && (
                                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                                <span className="text-muted-foreground">Shipped:</span>
                                                                                                <span className="font-medium text-foreground">{formatDate(order.shippedAt)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {order.deliveredAt && (
                                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                                <span className="text-muted-foreground">Delivered:</span>
                                                                                                <span className="font-medium text-foreground">{formatDate(order.deliveredAt)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}

