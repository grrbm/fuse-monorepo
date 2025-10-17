import {
    getClinicRevenue,
    getClinicOrders,
    getClinicSubscriptions,
    getNewPatients,
    getRevenueTimeSeries,
    getProductProfitMargins,
    getRecentOrders,
    getActiveSubscriptionsForRevenue,
    DateRange,
    ActiveSubscriptionData
} from './db/dashboard';
import {
    MOCK_DASHBOARD_METRICS,
    MOCK_REVENUE_CHART_DATA,
    MOCK_EARNINGS_REPORT,
    MOCK_RECENT_ORDERS,
    shouldUseMockData
} from './mockDashboardData';

export interface DashboardMetrics {
    revenue: number;
    orderCount: number;
    avgOrderValue: number;
    conversionRate: number;
    activeSubscriptions: number;
    newPatients: number;
    percentageChanges?: {
        revenue?: number;
        orders?: number;
        avgOrderValue?: number;
    };
}

export interface EarningsReport {
    totalRevenue: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    productBreakdown: Array<{
        productId: string;
        productName: string;
        unitsSold: number;
        cost: number;
        revenue: number;
        profit: number;
        profitMargin: number;
    }>;
}

class DashboardService {
    /**
     * Get dashboard metrics for a clinic within a date range
     */
    async getDashboardMetrics(
        clinicId: string,
        dateRange: DateRange,
        includePreviousPeriod: boolean = true
    ): Promise<DashboardMetrics> {
        // Use mock data if enabled or if no real data exists
        if (shouldUseMockData()) {
            console.log('📊 Using mock dashboard metrics');
            return MOCK_DASHBOARD_METRICS;
        }

        const { start, end } = dateRange;

        // Get current period data
        const [revenueData, activeSubscriptions, newPatients] = await Promise.all([
            getClinicRevenue(clinicId, start, end),
            getClinicSubscriptions(clinicId),
            getNewPatients(clinicId, start, end)
        ]);

        const { totalRevenue, orderCount } = revenueData;

        // If no orders exist, return mock data
        if (orderCount === 0) {
            console.log('📊 No real orders found, using mock dashboard metrics');
            return MOCK_DASHBOARD_METRICS;
        }

        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        // Simple conversion rate: (paid orders / total orders) * 100
        const { total: totalOrders } = await getClinicOrders(clinicId, start, end);
        const conversionRate = totalOrders > 0 ? (orderCount / totalOrders) * 100 : 0;

        const metrics: DashboardMetrics = {
            revenue: totalRevenue,
            orderCount,
            avgOrderValue,
            conversionRate,
            activeSubscriptions,
            newPatients
        };

        // Calculate percentage changes from previous period
        if (includePreviousPeriod) {
            const periodLength = end.getTime() - start.getTime();
            const prevStart = new Date(start.getTime() - periodLength);
            const prevEnd = new Date(start);

            const prevRevenueData = await getClinicRevenue(clinicId, prevStart, prevEnd);
            const prevAvgOrderValue = prevRevenueData.orderCount > 0 
                ? prevRevenueData.totalRevenue / prevRevenueData.orderCount 
                : 0;

            metrics.percentageChanges = {
                revenue: this.calculatePercentageChange(prevRevenueData.totalRevenue, totalRevenue),
                orders: this.calculatePercentageChange(prevRevenueData.orderCount, orderCount),
                avgOrderValue: this.calculatePercentageChange(prevAvgOrderValue, avgOrderValue)
            };
        }

        return metrics;
    }

    /**
     * Get revenue over time for charting
     * Fills in missing dates with $0 to show complete timeline
     */
    async getRevenueOverTime(
        clinicId: string,
        dateRange: DateRange,
        interval: 'daily' | 'weekly' = 'daily'
    ) {
        if (shouldUseMockData()) {
            console.log('📈 Using mock revenue chart data (dynamic dates)');
            return this.generateMockRevenueChartData(dateRange, interval);
        }

        const data = await getRevenueTimeSeries(clinicId, dateRange.start, dateRange.end, interval);
        
        // If no data, return mock
        if (data.length === 0) {
            console.log('📈 No real revenue data found, using mock chart data');
            return this.generateMockRevenueChartData(dateRange, interval);
        }

        // Fill in missing dates with $0 to show complete timeline (including future dates)
        const filledData = this.fillMissingDates(data, dateRange, interval);
        
        return filledData;
    }

    /**
     * Fill in missing dates with $0 values
     */
    private fillMissingDates(
        data: Array<{ date: string; revenue: number; orders: number }>,
        dateRange: DateRange,
        interval: 'daily' | 'weekly'
    ): Array<{ date: string; revenue: number; orders: number }> {
        const { start, end } = dateRange;
        const dataMap = new Map(data.map(d => [d.date, d]));
        const filledData: Array<{ date: string; revenue: number; orders: number }> = [];
        
        const formatDateLocal = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        if (interval === 'daily') {
            const currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            
            while (currentDate <= end) {
                const dateKey = formatDateLocal(currentDate);
                
                if (dataMap.has(dateKey)) {
                    filledData.push(dataMap.get(dateKey)!);
                } else {
                    // Fill with $0 for dates with no data
                    filledData.push({
                        date: dateKey,
                        revenue: 0,
                        orders: 0
                    });
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else {
            // For weekly, just return the data as-is (weekly aggregation is already handled)
            return data;
        }
        
        return filledData;
    }

    /**
     * Generate mock revenue chart data based on date range
     * Uses local date components to avoid timezone shifts
     */
    private generateMockRevenueChartData(dateRange: DateRange, interval: 'daily' | 'weekly' = 'daily') {
        const mockData: Array<{ date: string; revenue: number; orders: number }> = [];
        const { start, end } = dateRange;
        
        // Helper to format date as YYYY-MM-DD in local timezone
        const formatDateLocal = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        if (interval === 'daily') {
            // Generate daily data - use date components to avoid timezone issues
            const currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set to start of today for comparison
            let dayIndex = 0;
            
            while (currentDate <= end) {
                // Check if this date is in the future
                const isFutureDate = currentDate > today;
                
                // For future dates, return $0. For past/today, generate realistic data
                let revenue = 0;
                let orders = 0;
                
                if (!isFutureDate) {
                    // Generate semi-realistic revenue based on day of week
                    const dayOfWeek = currentDate.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    
                    const baseRevenue = isWeekend ? 2500 : 4500;
                    const variance = (Math.sin(dayIndex) + 1) * 1500; // Add some variation
                    revenue = Math.round((baseRevenue + variance) * 100) / 100;
                    
                    const baseOrders = isWeekend ? 8 : 15;
                    const orderVariance = Math.floor(Math.random() * 8);
                    orders = baseOrders + orderVariance;
                }
                
                mockData.push({
                    date: formatDateLocal(currentDate),
                    revenue,
                    orders
                });
                
                currentDate.setDate(currentDate.getDate() + 1);
                dayIndex++;
            }
        } else {
            // Generate weekly data
            const currentDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            let weekIndex = 0;
            
            while (currentDate <= end) {
                const baseRevenue = 28000;
                const variance = (Math.sin(weekIndex) + 1) * 5000;
                const revenue = Math.round((baseRevenue + variance) * 100) / 100;
                
                const baseOrders = 85;
                const orderVariance = Math.floor(Math.random() * 20);
                const orders = baseOrders + orderVariance;
                
                mockData.push({
                    date: formatDateLocal(currentDate),
                    revenue,
                    orders
                });
                
                currentDate.setDate(currentDate.getDate() + 7);
                weekIndex++;
            }
        }
        
        return mockData;
    }

    /**
     * Get earnings report with profit margins
     */
    async getEarningsReport(
        clinicId: string,
        dateRange: DateRange
    ): Promise<EarningsReport> {
        if (shouldUseMockData()) {
            console.log('💰 Using mock earnings report data');
            return MOCK_EARNINGS_REPORT;
        }

        const productProfits = await getProductProfitMargins(
            clinicId,
            dateRange.start,
            dateRange.end
        );

        // If no products, return mock
        if (productProfits.length === 0) {
            console.log('💰 No real earnings data found, using mock earnings report');
            return MOCK_EARNINGS_REPORT;
        }

        const totalRevenue = productProfits.reduce((sum, p) => sum + p.revenue, 0);
        const totalCost = productProfits.reduce((sum, p) => sum + p.cost, 0);
        const profit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            profit,
            profitMargin,
            productBreakdown: productProfits
        };
    }

    /**
     * Get recent activity/orders
     */
    async getRecentActivity(clinicId: string, limit: number = 10) {
        if (shouldUseMockData()) {
            console.log('📋 Using mock recent orders data');
            return MOCK_RECENT_ORDERS.slice(0, limit);
        }

        const orders = await getRecentOrders(clinicId, limit);
        
        // If no orders, return mock
        if (orders.length === 0) {
            console.log('📋 No real orders found, using mock recent orders');
            return MOCK_RECENT_ORDERS.slice(0, limit);
        }

        return orders;
    }

    /**
     * Get active subscriptions count
     */
    async getActiveSubscriptions(clinicId: string) {
        return getClinicSubscriptions(clinicId);
    }

    /**
     * Get projected recurring revenue from active subscriptions
     * Shows actual expected renewal dates (spikes) for remaining days of month
     * @param daysToProject - Number of days to project (typically remaining days in current month)
     */
    async getProjectedRecurringRevenue(
        clinicId: string,
        endDate: Date,
        daysToProject: number
    ) {
        if (shouldUseMockData()) {
            console.log('📊 Using mock projected revenue data (14 days with renewal events)');
            return this.generateMockProjectedRevenue(endDate, daysToProject);
        }

        const subscriptions = await getActiveSubscriptionsForRevenue(clinicId);

        if (subscriptions.length === 0) {
            console.log('📊 No active subscriptions, using mock projected revenue');
            return this.generateMockProjectedRevenue(endDate, daysToProject);
        }

        // Create a map of dates to revenue amounts
        const revenueByDate = new Map<string, number>();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() + 1); // Start projections from day after end date
        const endProjectionDate = new Date(startDate);
        endProjectionDate.setDate(endProjectionDate.getDate() + daysToProject - 1);

        // Initialize all days with 0
        for (let day = 0; day < daysToProject; day++) {
            const projectionDate = new Date(startDate);
            projectionDate.setDate(projectionDate.getDate() + day);
            const dateKey = projectionDate.toISOString().split('T')[0];
            revenueByDate.set(dateKey, 0);
        }

        // For each subscription, add revenue on its next billing date if within 14 days
        subscriptions.forEach(sub => {
            let nextBilling = new Date(sub.nextBillingDate);
            
            // If next billing is in the past, project forward based on interval
            while (nextBilling <= endDate) {
                // Assume monthly billing (30 days)
                nextBilling.setDate(nextBilling.getDate() + 30);
            }

            // Add subscription renewal revenue on its billing date if within projection window
            while (nextBilling <= endProjectionDate) {
                const dateKey = nextBilling.toISOString().split('T')[0];
                if (revenueByDate.has(dateKey)) {
                    const currentRevenue = revenueByDate.get(dateKey) || 0;
                    revenueByDate.set(dateKey, currentRevenue + sub.amount);
                }
                
                // Move to next billing cycle (monthly)
                nextBilling.setDate(nextBilling.getDate() + 30);
            }
        });

        // Convert map to array - use local date formatting
        const formatDateLocal = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const projections: Array<{ date: string; projectedRevenue: number }> = [];
        for (let day = 0; day < daysToProject; day++) {
            const projectionDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + day);
            const dateKey = formatDateLocal(projectionDate);
            
            projections.push({
                date: dateKey,
                projectedRevenue: Math.round((revenueByDate.get(dateKey) || 0) * 100) / 100
            });
        }

        return projections;
    }

    /**
     * Generate mock projected revenue for testing (distributed across month)
     * Uses local date components to avoid timezone shifts
     */
    private generateMockProjectedRevenue(endDate: Date, daysToProject: number) {
        const projections: Array<{ date: string; projectedRevenue: number }> = [];
        
        // Helper to format date as YYYY-MM-DD in local timezone
        const formatDateLocal = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Start from day after endDate, using local date components
        const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

        // Simulate subscription renewals on specific days throughout the month
        // Mock: 10 subscriptions with staggered billing dates
        const mockSubscriptions = [
            { amount: 450, billingDay: 3 },
            { amount: 380, billingDay: 5 },
            { amount: 520, billingDay: 7 },
            { amount: 290, billingDay: 10 },
            { amount: 410, billingDay: 12 },
            { amount: 350, billingDay: 15 },
            { amount: 480, billingDay: 18 },
            { amount: 320, billingDay: 21 },
            { amount: 390, billingDay: 25 },
            { amount: 440, billingDay: 28 },
        ];

        for (let day = 0; day < daysToProject; day++) {
            const projectionDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + day);

            // Check if any subscriptions renew on this day
            let dayRevenue = 0;
            const dayOfMonth = projectionDate.getDate();
            mockSubscriptions.forEach(sub => {
                if (dayOfMonth === sub.billingDay) {
                    dayRevenue += sub.amount;
                }
            });

            projections.push({
                date: formatDateLocal(projectionDate),
                projectedRevenue: Math.round(dayRevenue * 100) / 100
            });
        }

        return projections;
    }

    /**
     * Helper to calculate percentage change
     */
    private calculatePercentageChange(oldValue: number, newValue: number): number {
        if (oldValue === 0) {
            return newValue > 0 ? 100 : 0;
        }
        return ((newValue - oldValue) / oldValue) * 100;
    }
}

export default DashboardService;

