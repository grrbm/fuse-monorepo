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
        const { start, end } = dateRange;

        // Get current period data
        const [revenueData, activeSubscriptions, newPatients] = await Promise.all([
            getClinicRevenue(clinicId, start, end),
            getClinicSubscriptions(clinicId),
            getNewPatients(clinicId, start, end)
        ]);

        const { totalRevenue, orderCount } = revenueData;
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
        const data = await getRevenueTimeSeries(clinicId, dateRange.start, dateRange.end, interval);
        
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
     * Get earnings report with profit margins
     */
    async getEarningsReport(
        clinicId: string,
        dateRange: DateRange
    ): Promise<EarningsReport> {
        const productProfits = await getProductProfitMargins(
            clinicId,
            dateRange.start,
            dateRange.end
        );

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
     * Get recent activity/orders (HIPAA compliant - no patient PHI)
     */
    async getRecentActivity(clinicId: string, limit: number = 10) {
        return await getRecentOrders(clinicId, limit);
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
        const subscriptions = await getActiveSubscriptionsForRevenue(clinicId);

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

        // For each subscription, add revenue on its next billing date if within projection window
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
