import { Op, QueryTypes } from 'sequelize';
import Order from '../../models/Order';
import Payment from '../../models/Payment';
import User from '../../models/User';
import Subscription from '../../models/Subscription';
import TenantProduct from '../../models/TenantProduct';
import Product from '../../models/Product';
import OrderItem from '../../models/OrderItem';
import { sequelize } from '../../config/database';

export interface DateRange {
    start: Date;
    end: Date;
}

export interface RevenueData {
    totalRevenue: number;
    orderCount: number;
}

export interface RevenueTimeSeriesPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface ProductProfitData {
    productId: string;
    productName: string;
    unitsSold: number;
    cost: number;
    revenue: number;
    profit: number;
    profitMargin: number;
}

export const getClinicRevenue = async (
    clinicId: string,
    startDate: Date,
    endDate: Date
): Promise<RevenueData> => {
    const orders = await Order.findAll({
        where: {
            clinicId,
            status: 'paid',
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [{
            model: Payment,
            as: 'payment',
            where: { status: 'paid' },
            required: false
        }]
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const orderCount = orders.length;

    return { totalRevenue, orderCount };
};

export const getClinicOrders = async (
    clinicId: string,
    startDate: Date,
    endDate: Date
): Promise<{ orders: Order[], total: number }> => {
    const orders = await Order.findAll({
        where: {
            clinicId,
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: Payment,
                as: 'payment'
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return { orders, total: orders.length };
};

export const getClinicSubscriptions = async (clinicId: string): Promise<number> => {
    const activeSubscriptions = await Subscription.count({
        where: {
            clinicId,
            status: 'active'
        }
    });

    return activeSubscriptions;
};

export const getNewPatients = async (
    clinicId: string,
    startDate: Date,
    endDate: Date
): Promise<number> => {
    const newPatients = await User.count({
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        include: [{
            model: Order,
            as: 'orders',
            where: { clinicId },
            required: true
        }],
        distinct: true
    });

    return newPatients;
};

export const getRevenueTimeSeries = async (
    clinicId: string,
    startDate: Date,
    endDate: Date,
    interval: 'daily' | 'weekly' = 'daily'
): Promise<RevenueTimeSeriesPoint[]> => {
    const dateFormat = interval === 'daily' ? '%Y-%m-%d' : '%Y-%W';
    
    const results = await sequelize.query(
        `
        SELECT 
            DATE_FORMAT(o.createdAt, :dateFormat) as date,
            SUM(COALESCE(o.totalAmount, 0)) as revenue,
            COUNT(o.id) as orders
        FROM Orders o
        WHERE o.clinicId = :clinicId
            AND o.status = 'paid'
            AND o.createdAt BETWEEN :startDate AND :endDate
        GROUP BY DATE_FORMAT(o.createdAt, :dateFormat)
        ORDER BY date ASC
        `,
        {
            replacements: { 
                clinicId, 
                startDate, 
                endDate,
                dateFormat 
            },
            type: QueryTypes.SELECT
        }
    ) as any[];

    return results.map(row => ({
        date: row.date,
        revenue: Number(row.revenue),
        orders: Number(row.orders)
    }));
};

export const getProductProfitMargins = async (
    clinicId: string,
    startDate: Date,
    endDate: Date
): Promise<ProductProfitData[]> => {
    const orderItems = await OrderItem.findAll({
        include: [
            {
                model: Order,
                as: 'order',
                where: {
                    clinicId,
                    status: 'paid',
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                required: true
            },
            {
                model: Product,
                as: 'product',
                required: true
            }
        ]
    });

    // Aggregate by product
    const productMap = new Map<string, {
        name: string;
        unitsSold: number;
        revenue: number;
        cost: number;
    }>();

    orderItems.forEach(item => {
        const productId = item.productId;
        const productName = item.product?.name || 'Unknown Product';
        const quantity = Number(item.quantity);
        const itemRevenue = Number(item.unitPrice) * quantity;
        // For now, use the unit price as both revenue and cost (profit margin will be 0)
        // In the future, you can add a cost field to Product or TenantProduct
        const costPerUnit = Number(item.unitPrice) * 0.5; // Assuming 50% cost ratio as placeholder
        const itemCost = costPerUnit * quantity;

        if (productMap.has(productId)) {
            const existing = productMap.get(productId)!;
            existing.unitsSold += quantity;
            existing.revenue += itemRevenue;
            existing.cost += itemCost;
        } else {
            productMap.set(productId, {
                name: productName,
                unitsSold: quantity,
                revenue: itemRevenue,
                cost: itemCost
            });
        }
    });

    // Convert to array with profit calculations
    const results: ProductProfitData[] = [];
    productMap.forEach((data, productId) => {
        const profit = data.revenue - data.cost;
        const profitMargin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

        results.push({
            productId,
            productName: data.name,
            unitsSold: data.unitsSold,
            cost: data.cost,
            revenue: data.revenue,
            profit,
            profitMargin
        });
    });

    return results.sort((a, b) => b.revenue - a.revenue);
};

export const getRecentOrders = async (
    clinicId: string,
    limit: number = 10
): Promise<Order[]> => {
    const orders = await Order.findAll({
        where: { clinicId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
                model: OrderItem,
                as: 'orderItems',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name']
                }]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit
    });

    return orders;
};

export interface ActiveSubscriptionData {
    id: string;
    amount: number;
    billingInterval: string; // 'monthly', 'quarterly', 'yearly'
    nextBillingDate: Date;
    prescriptionExpiryDate?: Date;
    userId: string;
}

export const getActiveSubscriptionsForRevenue = async (
    clinicId: string
): Promise<ActiveSubscriptionData[]> => {
    // Note: This is a placeholder implementation
    // You'll need to adjust this based on your actual subscription and billing setup
    // For now, we'll use the Order model to estimate recurring revenue
    
    const recentOrders = await Order.findAll({
        where: {
            clinicId,
            status: 'paid',
            createdAt: {
                [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        },
        attributes: ['id', 'totalAmount', 'createdAt'],
        limit: 100
    });

    // Group by month and calculate average
    const monthlyRevenue = recentOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const avgMonthlyRevenue = recentOrders.length > 0 ? monthlyRevenue / recentOrders.length * 30 : 0;

    // Return a single subscription representing recurring revenue
    // In a real implementation, you'd query actual subscription records
    if (avgMonthlyRevenue > 0) {
        return [{
            id: 'estimated-recurring',
            amount: avgMonthlyRevenue,
            billingInterval: 'monthly',
            nextBillingDate: new Date(),
            prescriptionExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months default
            userId: 'system'
        }];
    }

    return [];
};

