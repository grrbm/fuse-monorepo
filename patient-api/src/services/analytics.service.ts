import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import TenantAnalyticsEvents from '../models/TenantAnalyticsEvents';
import FormAnalyticsDaily from '../models/FormAnalyticsDaily';

export class AnalyticsService {
  /**
   * Aggregate raw analytics events into daily summaries
   * This should be run daily to aggregate yesterday's data
   */
  static async aggregateDailyAnalytics(date?: string): Promise<void> {
    try {
      // If no date provided, aggregate yesterday's data
      const targetDate = date || this.getYesterdayDate();
      
      console.log(`[Analytics] Starting daily aggregation for ${targetDate}`);

      // Get all events for the target date
      const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
      const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);

      const events = await TenantAnalyticsEvents.findAll({
        where: {
          createdAt: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay,
          },
        },
        attributes: ['userId', 'productId', 'formId', 'eventType', 'dropOffStage'],
      });

      // If no events, skip aggregation for this date
      if (events.length === 0) {
        console.log(`[Analytics] No events for ${targetDate}, skipping`);
        return;
      }

      console.log(`[Analytics] Found ${events.length} events for ${targetDate}`);

      // Group events by tenantId, productId, formId
      const aggregated: Record<string, {
        tenantId: string;
        productId: string;
        formId: string;
        views: number;
        conversions: number;
        productStageDropOffs: number;
        paymentStageDropOffs: number;
        accountStageDropOffs: number;
      }> = {};

      events.forEach((event) => {
        const eventData = event.toJSON();
        const key = `${eventData.userId}-${eventData.productId}-${eventData.formId}`;

        if (!aggregated[key]) {
          aggregated[key] = {
            tenantId: eventData.userId,
            productId: eventData.productId,
            formId: eventData.formId,
            views: 0,
            conversions: 0,
            productStageDropOffs: 0,
            paymentStageDropOffs: 0,
            accountStageDropOffs: 0,
          };
        }

        if (eventData.eventType === 'view') {
          aggregated[key].views++;
        } else if (eventData.eventType === 'conversion') {
          aggregated[key].conversions++;
        } else if (eventData.eventType === 'dropoff') {
          // Count drop-offs by stage
          if (eventData.dropOffStage === 'product') {
            aggregated[key].productStageDropOffs++;
          } else if (eventData.dropOffStage === 'payment') {
            aggregated[key].paymentStageDropOffs++;
          } else if (eventData.dropOffStage === 'account') {
            aggregated[key].accountStageDropOffs++;
          }
        }
      });

      // Insert or update aggregated data
      const aggregatedArray = Object.values(aggregated);
      console.log(`[Analytics] Aggregating ${aggregatedArray.length} unique form combinations`);

      for (const data of aggregatedArray) {
        await FormAnalyticsDaily.upsert({
          date: targetDate,
          tenantId: data.tenantId,
          productId: data.productId,
          formId: data.formId,
          views: data.views,
          conversions: data.conversions,
          productStageDropOffs: data.productStageDropOffs,
          paymentStageDropOffs: data.paymentStageDropOffs,
          accountStageDropOffs: data.accountStageDropOffs,
        });
      }

      console.log(`[Analytics] Daily aggregation completed for ${targetDate}`);
    } catch (error) {
      console.error('[Analytics] Error aggregating daily analytics:', error);
      throw error;
    }
  }

  /**
   * Delete analytics events older than the retention period (365 days)
   * This should be run after daily aggregation to clean up old data
   */
  static async applyRetentionPolicy(retentionDays: number = 365): Promise<number> {
    try {
      console.log(`[Analytics] Applying retention policy: ${retentionDays} days`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await TenantAnalyticsEvents.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      console.log(`[Analytics] Deleted ${result} events older than ${cutoffDate.toISOString()}`);
      return result;
    } catch (error) {
      console.error('[Analytics] Error applying retention policy:', error);
      throw error;
    }
  }

  /**
   * Run daily maintenance: aggregate yesterday's data and apply retention policy
   * This runs on-demand when analytics are accessed
   */
  static async runDailyMaintenance(): Promise<void> {
    try {
      console.log('[Analytics] Starting on-demand maintenance');

      // First, aggregate yesterday's data
      await this.aggregateDailyAnalytics();

      // Then, apply retention policy to delete old events
      // Only delete events older than 365 days that have been aggregated
      const deletedCount = await this.applyRetentionPolicy(365);

      console.log('[Analytics] On-demand maintenance completed', {
        deletedEvents: deletedCount,
      });
    } catch (error) {
      console.error('[Analytics] Error during on-demand maintenance:', error);
      throw error;
    }
  }

  /**
   * Check if aggregation has been run for all days up to a year back, and aggregate missing days
   * This ensures data is fresh when viewing analytics
   * Only aggregates dates where events actually exist
   */
  static async ensureDataAggregated(): Promise<void> {
    try {
      console.log('🔍 [Analytics Service] ensureDataAggregated called');
      console.log('[Analytics] Checking for missing aggregations...');

      // Get date range: from 365 days ago to yesterday
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1); // Yesterday
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365); // 365 days ago

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log('📅 [Analytics Service] Date range:', { startDateStr, endDateStr });

      console.log('🔍 [Analytics Service] Fetching existing aggregations...');
      // Get all dates that have already been aggregated in this range
      const existingAggregations = await FormAnalyticsDaily.findAll({
        where: {
          date: {
            [Op.gte]: startDateStr,
            [Op.lte]: endDateStr,
          },
        },
        attributes: ['date'],
        group: ['date'],
        raw: true,
      });

      console.log(`✅ [Analytics Service] Found ${existingAggregations.length} existing aggregations`);

      const aggregatedDates = new Set(
        existingAggregations.map((agg: any) => agg.date)
      );

      console.log('🔍 [Analytics Service] Fetching events with dates...');
      // Get distinct dates that have events in the date range
      const eventsWithDates = await sequelize.query(
        `SELECT DISTINCT DATE("createdAt") as event_date 
         FROM "TenantAnalyticsEvents" 
         WHERE DATE("createdAt") >= :startDate 
         AND DATE("createdAt") <= :endDate 
         ORDER BY event_date ASC`,
        {
          replacements: { startDate: startDateStr, endDate: endDateStr },
          type: QueryTypes.SELECT,
        }
      );

      console.log(`✅ [Analytics Service] Found ${(eventsWithDates as any[]).length} dates with events`);

      // Find dates that have events but haven't been aggregated yet
      const datesToAggregate: string[] = [];
      
      for (const row of eventsWithDates as any[]) {
        const eventDate = row.event_date;
        if (!aggregatedDates.has(eventDate)) {
          datesToAggregate.push(eventDate);
        }
      }

      if (datesToAggregate.length === 0) {
        console.log('✅ [Analytics Service] All dates with events are already aggregated');
        return;
      }

      console.log(`⚙️ [Analytics Service] Found ${datesToAggregate.length} dates with events to aggregate`);

      // Aggregate each missing date
      for (const dateStr of datesToAggregate) {
        console.log(`⚙️ [Analytics Service] Aggregating ${dateStr}...`);
        await this.aggregateDailyAnalytics(dateStr);
      }

      console.log(`✅ [Analytics Service] Successfully aggregated ${datesToAggregate.length} dates`);
    } catch (error) {
      console.error('❌ [Analytics Service] Error ensuring data is aggregated:', error);
      // Don't throw - we can still show analytics from events table
    }
  }

  /**
   * Backfill daily aggregations for a date range
   * Useful for initial setup or if aggregation was missed for some days
   */
  static async backfillDailyAggregations(startDate: string, endDate: string): Promise<void> {
    try {
      console.log(`[Analytics] Backfilling aggregations from ${startDate} to ${endDate}`);

      const start = new Date(startDate);
      const end = new Date(endDate);
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateString = currentDate.toISOString().split('T')[0];
        await this.aggregateDailyAnalytics(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('[Analytics] Backfill completed');
    } catch (error) {
      console.error('[Analytics] Error during backfill:', error);
      throw error;
    }
  }

  /**
   * Get analytics data from both events and daily aggregations
   * For recent data (< 365 days), use events table
   * For older data, use daily aggregations
   */
  static async getAnalytics(
    tenantId: string,
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    views: number;
    conversions: number;
    formBreakdown: Array<{
      formId: string;
      views: number;
      conversions: number;
    }>;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365);

      let totalViews = 0;
      let totalConversions = 0;
      const formData: Record<string, { views: number; conversions: number }> = {};

      // If the date range includes recent data (< 365 days), query events table
      if (endDate > cutoffDate) {
        const recentStartDate = startDate > cutoffDate ? startDate : cutoffDate;

        const events = await TenantAnalyticsEvents.findAll({
          where: {
            userId: tenantId,
            productId,
            createdAt: {
              [Op.gte]: recentStartDate,
              [Op.lte]: endDate,
            },
          },
        });

        events.forEach((event) => {
          const eventData = event.toJSON();
          if (!formData[eventData.formId]) {
            formData[eventData.formId] = { views: 0, conversions: 0 };
          }

          if (eventData.eventType === 'view') {
            totalViews++;
            formData[eventData.formId].views++;
          } else if (eventData.eventType === 'conversion') {
            totalConversions++;
            formData[eventData.formId].conversions++;
          }
        });
      }

      // If the date range includes older data (>= 365 days), query aggregated table
      if (startDate < cutoffDate) {
        const oldEndDate = endDate < cutoffDate ? endDate : cutoffDate;

        const dailyData = await FormAnalyticsDaily.findAll({
          where: {
            tenantId,
            productId,
            date: {
              [Op.gte]: startDate.toISOString().split('T')[0],
              [Op.lte]: oldEndDate.toISOString().split('T')[0],
            },
          },
        });

        dailyData.forEach((daily) => {
          const dailyDataJson = daily.toJSON();
          if (!formData[dailyDataJson.formId]) {
            formData[dailyDataJson.formId] = { views: 0, conversions: 0 };
          }

          totalViews += dailyDataJson.views;
          totalConversions += dailyDataJson.conversions;
          formData[dailyDataJson.formId].views += dailyDataJson.views;
          formData[dailyDataJson.formId].conversions += dailyDataJson.conversions;
        });
      }

      return {
        views: totalViews,
        conversions: totalConversions,
        formBreakdown: Object.entries(formData).map(([formId, data]) => ({
          formId,
          views: data.views,
          conversions: data.conversions,
        })),
      };
    } catch (error) {
      console.error('[Analytics] Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Helper method to get yesterday's date in YYYY-MM-DD format
   */
  private static getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
}

export default AnalyticsService;

