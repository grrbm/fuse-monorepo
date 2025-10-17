/**
 * TEMPORARY MOCK DATA FOR DASHBOARD TESTING
 * 
 * This file provides mock data for the dashboard when no real orders exist.
 * DELETE THIS FILE once real orders start coming in.
 * 
 * To disable mock data, set USE_MOCK_DASHBOARD_DATA to false in .env.local
 */

export const MOCK_DASHBOARD_METRICS = {
    revenue: 45890.50,
    orderCount: 127,
    avgOrderValue: 361.34,
    conversionRate: 68.5,
    activeSubscriptions: 43,
    newPatients: 18,
    percentageChanges: {
        revenue: 15.3,
        orders: 8.7,
        avgOrderValue: 6.2
    }
};

// NOTE: MOCK_REVENUE_CHART_DATA is now generated dynamically in dashboard.service.ts
// based on the requested date range. This static data is kept for reference but not used.
export const MOCK_REVENUE_CHART_DATA = [
    { date: '2024-10-09', revenue: 3420.00, orders: 12 },
    { date: '2024-10-10', revenue: 4850.50, orders: 15 },
    { date: '2024-10-11', revenue: 3120.00, orders: 9 },
    { date: '2024-10-12', revenue: 5670.25, orders: 18 },
    { date: '2024-10-13', revenue: 4230.75, orders: 11 },
    { date: '2024-10-14', revenue: 6890.00, orders: 21 },
    { date: '2024-10-15', revenue: 5420.50, orders: 16 },
    { date: '2024-10-16', revenue: 7120.75, orders: 23 }
];

export const MOCK_EARNINGS_REPORT = {
    totalRevenue: 45890.50,
    totalCost: 22945.25,
    profit: 22945.25,
    profitMargin: 50.0,
    productBreakdown: [
        {
            productId: 'mock-1',
            productName: 'Semaglutide 2.5mg',
            unitsSold: 45,
            cost: 6750.00,
            revenue: 13500.00,
            profit: 6750.00,
            profitMargin: 50.0
        },
        {
            productId: 'mock-2',
            productName: 'Tirzepatide 5mg',
            unitsSold: 32,
            cost: 5440.00,
            revenue: 10880.00,
            profit: 5440.00,
            profitMargin: 50.0
        },
        {
            productId: 'mock-3',
            productName: 'Minoxidil Solution',
            unitsSold: 28,
            cost: 1120.00,
            revenue: 2240.00,
            profit: 1120.00,
            profitMargin: 50.0
        },
        {
            productId: 'mock-4',
            productName: 'Tadalafil 20mg',
            unitsSold: 22,
            cost: 1980.00,
            revenue: 3960.00,
            profit: 1980.00,
            profitMargin: 50.0
        },
        {
            productId: 'mock-5',
            productName: 'Tretinoin Cream',
            unitsSold: 18,
            cost: 900.00,
            revenue: 1800.00,
            profit: 900.00,
            profitMargin: 50.0
        }
    ]
};

export const MOCK_RECENT_ORDERS = [
    {
        id: 'mock-order-1',
        totalAmount: 450.00,
        status: 'paid',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        user: {
            id: 'mock-user-1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.j@example.com'
        },
        orderItems: [
            {
                id: 'mock-item-1',
                product: {
                    id: 'mock-1',
                    name: 'Semaglutide 2.5mg'
                }
            }
        ]
    },
    {
        id: 'mock-order-2',
        totalAmount: 680.00,
        status: 'paid',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
        user: {
            id: 'mock-user-2',
            firstName: 'Michael',
            lastName: 'Chen',
            email: 'michael.c@example.com'
        },
        orderItems: [
            {
                id: 'mock-item-2',
                product: {
                    id: 'mock-2',
                    name: 'Tirzepatide 5mg'
                }
            },
            {
                id: 'mock-item-3',
                product: {
                    id: 'mock-3',
                    name: 'Minoxidil Solution'
                }
            }
        ]
    },
    {
        id: 'mock-order-3',
        totalAmount: 180.00,
        status: 'paid',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user: {
            id: 'mock-user-3',
            firstName: 'Emily',
            lastName: 'Rodriguez',
            email: 'emily.r@example.com'
        },
        orderItems: [
            {
                id: 'mock-item-4',
                product: {
                    id: 'mock-4',
                    name: 'Tadalafil 20mg'
                }
            }
        ]
    },
    {
        id: 'mock-order-4',
        totalAmount: 320.00,
        status: 'paid',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        user: {
            id: 'mock-user-4',
            firstName: 'David',
            lastName: 'Kim',
            email: 'david.k@example.com'
        },
        orderItems: [
            {
                id: 'mock-item-5',
                product: {
                    id: 'mock-5',
                    name: 'Tretinoin Cream'
                }
            }
        ]
    },
    {
        id: 'mock-order-5',
        totalAmount: 890.00,
        status: 'paid',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        user: {
            id: 'mock-user-5',
            firstName: 'Jessica',
            lastName: 'Martinez',
            email: 'jessica.m@example.com'
        },
        orderItems: [
            {
                id: 'mock-item-6',
                product: {
                    id: 'mock-1',
                    name: 'Semaglutide 2.5mg'
                }
            },
            {
                id: 'mock-item-7',
                product: {
                    id: 'mock-2',
                    name: 'Tirzepatide 5mg'
                }
            }
        ]
    }
];

/**
 * Check if mock data should be used
 * Returns true if USE_MOCK_DASHBOARD_DATA env var is set to 'true'
 * Default is true for easier testing
 */
export function shouldUseMockData(): boolean {
    const useMock = process.env.USE_MOCK_DASHBOARD_DATA;
    // Default to true if not set, so mock data works out of the box
    return useMock !== 'false';
}

