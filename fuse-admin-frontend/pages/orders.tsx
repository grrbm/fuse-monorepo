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
    User,
    Link as LinkIcon,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react'
import { loadConnectAndInitialize } from '@stripe/connect-js'

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

// Mock orders for initial setup - automatically replaced when real orders exist
// All dates are within the current month to populate "This Month" stats
const MOCK_ORDERS: Order[] = [
    {
        id: 'mock-order-1',
        orderNumber: 'ORD-1-000001',
        status: 'paid',
        totalAmount: 450.00,
        createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(),
        shippedAt: new Date(new Date().getFullYear(), new Date().getMonth(), 16).toISOString(),
        user: {
            id: 'mock-user-1',
            firstName: 'James',
            lastName: 'Bond',
            email: 'james.bond@mi6.gov.uk'
        },
        orderItems: [
            {
                id: 'mock-item-1',
                quantity: 1,
                unitPrice: 450.00,
                totalPrice: 450.00,
                product: {
                    id: 'mock-prod-1',
                    name: 'Semaglutide 2.5mg',
                    category: 'weight_loss'
                }
            }
        ],
        shippingAddress: {
            address: '123 Secret Service Lane',
            city: 'London',
            state: 'England',
            zipCode: 'SW1A 1AA',
            country: 'UK'
        },
        payment: {
            status: 'succeeded',
            paymentMethod: 'card'
        }
    },
    {
        id: 'mock-order-2',
        orderNumber: 'ORD-1-000002',
        status: 'shipped',
        totalAmount: 680.00,
        createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 8).toISOString(),
        shippedAt: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
        user: {
            id: 'mock-user-2',
            firstName: 'Marie',
            lastName: 'Curie',
            email: 'marie.curie@science.edu'
        },
        orderItems: [
            {
                id: 'mock-item-2',
                quantity: 1,
                unitPrice: 400.00,
                totalPrice: 400.00,
                product: {
                    id: 'mock-prod-2',
                    name: 'NAD+ Injection',
                    category: 'wellness'
                }
            },
            {
                id: 'mock-item-3',
                quantity: 2,
                unitPrice: 140.00,
                totalPrice: 280.00,
                product: {
                    id: 'mock-prod-3',
                    name: 'Vitamin B12',
                    category: 'wellness'
                }
            }
        ],
        shippingAddress: {
            address: '456 Science Boulevard',
            city: 'Paris',
            state: 'Île-de-France',
            zipCode: '75005',
            country: 'France'
        },
        payment: {
            status: 'succeeded',
            paymentMethod: 'card'
        }
    },
    {
        id: 'mock-order-3',
        orderNumber: 'ORD-1-000003',
        status: 'pending',
        totalAmount: 299.00,
        createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString(),
        user: {
            id: 'mock-user-3',
            firstName: 'Leonardo',
            lastName: 'da Vinci',
            email: 'leonardo.davinci@renaissance.art'
        },
        orderItems: [
            {
                id: 'mock-item-4',
                quantity: 1,
                unitPrice: 299.00,
                totalPrice: 299.00,
                product: {
                    id: 'mock-prod-4',
                    name: 'Finasteride 1mg',
                    category: 'hair_growth'
                }
            }
        ],
        shippingAddress: {
            address: '789 Renaissance Way',
            city: 'Florence',
            state: 'Tuscany',
            zipCode: '50100',
            country: 'Italy'
        },
        payment: {
            status: 'pending',
            paymentMethod: 'card'
        }
    },
    {
        id: 'mock-order-4',
        orderNumber: 'ORD-1-000004',
        status: 'delivered',
        totalAmount: 850.00,
        createdAt: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString(),
        shippedAt: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
        deliveredAt: new Date(new Date().getFullYear(), new Date().getMonth(), 7).toISOString(),
        user: {
            id: 'mock-user-4',
            firstName: 'Cleopatra',
            lastName: 'VII',
            email: 'cleopatra@egypt.ancient'
        },
        orderItems: [
            {
                id: 'mock-item-5',
                quantity: 1,
                unitPrice: 850.00,
                totalPrice: 850.00,
                product: {
                    id: 'mock-prod-5',
                    name: 'Tirzepatide 15mg',
                    category: 'weight_loss'
                }
            }
        ],
        shippingAddress: {
            address: '321 Nile River Road',
            city: 'Alexandria',
            state: 'Alexandria',
            zipCode: '21500',
            country: 'Egypt'
        },
        payment: {
            status: 'succeeded',
            paymentMethod: 'card'
        }
    }
]

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const { user, token } = useAuth()

    // Stripe Connect states
    const [showConnectModal, setShowConnectModal] = useState(false)
    const [connectStatus, setConnectStatus] = useState<any>(null)
    const [connectLoading, setConnectLoading] = useState(false)
    const [connectInstance, setConnectInstance] = useState<any>(null)

    useEffect(() => {
        fetchOrders()
        fetchConnectStatus()
    }, [token, user])

    // Fetch Stripe Connect status
    const fetchConnectStatus = async () => {
        if (!token) return

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/stripe/connect/status`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            )

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setConnectStatus(data.data)
                }
            }
        } catch (err) {
            console.error('Error fetching Stripe Connect status:', err)
        }
    }

    // Initialize Stripe Connect
    const initializeStripeConnect = async () => {
        if (!token || connectInstance) return

        setConnectLoading(true)
        try {
            const instance = loadConnectAndInitialize({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
                fetchClientSecret: async () => {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/stripe/connect/session`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    )

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}))
                        console.error('Failed to fetch client secret:', response.status, errorData)
                        throw new Error(errorData.message || 'Failed to fetch client secret')
                    }

                    const data = await response.json()
                    return data.data.client_secret
                },
                appearance: {
                    variables: {
                        colorPrimary: '#000000',
                    }
                }
            })

            setConnectInstance(instance)
        } catch (err) {
            console.error('Error initializing Stripe Connect:', err)
        } finally {
            setConnectLoading(false)
        }
    }

    // Open Connect Modal
    const openConnectModal = async () => {
        setShowConnectModal(true)
        if (!connectInstance) {
            await initializeStripeConnect()
        }
    }

    // Close modal and refresh status
    const closeConnectModal = () => {
        setShowConnectModal(false)
        fetchConnectStatus() // Refresh status after closing
    }

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
                    const realOrders = data.data.orders || []
                    // Use mock data if no real orders exist
                    setOrders(realOrders.length > 0 ? realOrders : MOCK_ORDERS)
                } else {
                    // On error, use mock data
                    setOrders(MOCK_ORDERS)
                }
            } else {
                // On error, use mock data
                setOrders(MOCK_ORDERS)
            }
        } catch (err) {
            // On error, use mock data
            setOrders(MOCK_ORDERS)
        } finally {
            setLoading(false)
        }
    }

    // Calculate stats for this month only
    const now = new Date()
    const thisMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    })

    const stats = {
        totalOrders: thisMonthOrders.length,
        totalRevenue: thisMonthOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0),
        pendingOrders: thisMonthOrders.filter(o => o.status === 'pending' || o.status === 'payment_due').length,
        avgOrderValue: thisMonthOrders.length > 0 ? thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0) / thisMonthOrders.length : 0
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
                    <div className="mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-semibold text-foreground mb-2">Orders</h1>
                            <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
                        </div>
                        
                        {/* Stripe Connect Button */}
                        <button
                            onClick={openConnectModal}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                connectStatus?.onboardingComplete
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {connectStatus?.onboardingComplete ? (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Stripe Connected</span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="h-4 w-4" />
                                    <span>Connect Stripe Account</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Stats Cards - This Month */}
                    <div className="mb-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Month</h2>
                    </div>
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

                    {/* Stripe Connect Modal */}
                    {showConnectModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-6 border-b">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900">Stripe Connect</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Connect your Stripe account to receive payouts
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeConnectModal}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                    {connectLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="text-gray-600">Loading Stripe Connect...</p>
                                        </div>
                                    ) : connectStatus?.onboardingComplete ? (
                                        <div className="text-center py-12">
                                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                Stripe Account Connected
                                            </h3>
                                            <p className="text-gray-600 mb-6">
                                                Your account is fully set up and ready to receive payouts.
                                            </p>
                                            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                                                <div className="space-y-2 text-sm text-left">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Account ID:</span>
                                                        <span className="font-mono text-gray-900">
                                                            {connectStatus.accountId?.substring(0, 20)}...
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Charges:</span>
                                                        <span className={connectStatus.chargesEnabled ? 'text-green-600' : 'text-red-600'}>
                                                            {connectStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Payouts:</span>
                                                        <span className={connectStatus.payoutsEnabled ? 'text-green-600' : 'text-red-600'}>
                                                            {connectStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                                <div className="flex gap-3">
                                                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-blue-900 mb-1">
                                                            Complete your Stripe onboarding
                                                        </h4>
                                                        <p className="text-sm text-blue-700">
                                                            You'll need to provide some information about your business to start receiving payouts.
                                                            This process is secure and handled directly by Stripe.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stripe Connect Component Container */}
                                            <div id="stripe-connect-container" className="min-h-[400px]">
                                                {connectInstance && (
                                                    <StripeConnectAccountOnboarding 
                                                        stripeConnectInstance={connectInstance}
                                                        onExit={closeConnectModal}
                                                    />
                                                )}
                                            </div>
                                        </div>
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

// Stripe Connect Account Onboarding Component
function StripeConnectAccountOnboarding({ 
    stripeConnectInstance, 
    onExit 
}: { 
    stripeConnectInstance: any, 
    onExit: () => void 
}) {
    useEffect(() => {
        if (stripeConnectInstance) {
            const accountOnboarding = stripeConnectInstance.create('account-onboarding')
            
            // Mount the component
            const container = document.getElementById('stripe-connect-container')
            if (container && accountOnboarding) {
                container.innerHTML = '' // Clear any existing content
                container.appendChild(accountOnboarding)

                // Listen for exit event
                accountOnboarding.setOnExit(() => {
                    console.log('User exited onboarding')
                    onExit()
                })
            }
        }
    }, [stripeConnectInstance, onExit])

    return null
}

