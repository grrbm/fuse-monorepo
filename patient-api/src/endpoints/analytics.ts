import { Router, Request, Response } from 'express';
import TenantAnalyticsEvents from '../models/TenantAnalyticsEvents';
import TenantProduct from '../models/TenantProduct';
import Product from '../models/Product';
import TenantProductForm from '../models/TenantProductForm';
import FormAnalyticsDaily from '../models/FormAnalyticsDaily';
import { authenticateJWT, getCurrentUser } from '../config/jwt';
import { Op } from 'sequelize';
import AnalyticsService from '../services/analytics.service';

const router = Router();

// Track analytics event (view or conversion)
router.post('/analytics/track', async (req: Request, res: Response) => {
  try {
    console.log('📊 [Analytics API] Received tracking request');
    console.log('📊 [Analytics API] Request body:', req.body);
    
    const { userId, productId, formId, eventType, sessionId, metadata } = req.body;

    if (!userId || !productId || !formId || !eventType) {
      console.log('❌ [Analytics API] Missing required fields:', { userId, productId, formId, eventType });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, productId, formId, eventType',
      });
    }

    if (!['view', 'conversion'].includes(eventType)) {
      console.log('❌ [Analytics API] Invalid eventType:', eventType);
      return res.status(400).json({
        success: false,
        error: 'eventType must be either "view" or "conversion"',
      });
    }

    console.log('📊 [Analytics API] Creating analytics event...');
    const analyticsEvent = await TenantAnalyticsEvents.create({
      userId,
      productId,
      formId,
      eventType,
      sessionId,
      metadata,
    });

    console.log('✅ [Analytics API] Analytics event created successfully:', analyticsEvent.id);
    return res.json({
      success: true,
      data: analyticsEvent.toJSON(),
    });
  } catch (error) {
    console.error('❌ [Analytics API] Error tracking analytics:', error);
    if (error instanceof Error) {
      console.error('❌ [Analytics API] Error message:', error.message);
      console.error('❌ [Analytics API] Error stack:', error.stack);
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to track analytics event',
    });
  }
});

// Get analytics for a specific product
router.get('/analytics/products/:productId', authenticateJWT, async (req: Request, res: Response) => {
  try {
    console.log('📦 [Product Analytics] Request received');
    const { productId } = req.params;
    const { timeRange = '30d' } = req.query;
    const currentUser = getCurrentUser(req);
    const userId = currentUser?.id;

    console.log('📦 [Product Analytics] Product ID:', productId);
    console.log('📦 [Product Analytics] User ID:', userId);
    console.log('📦 [Product Analytics] Time Range:', timeRange);

    if (!userId) {
      console.log('❌ [Product Analytics] No user ID found - unauthorized');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    console.log('📦 [Product Analytics] Starting ensureDataAggregated...');
    // Ensure yesterday's data is aggregated
    await AnalyticsService.ensureDataAggregated();
    console.log('✅ [Product Analytics] ensureDataAggregated completed');

    // Verify the tenant product belongs to the user
    const tenantProduct = await TenantProduct.findOne({
      where: {
        id: productId,
      },
      include: [{
        model: Product,
        required: true
      }]
    });

    if (!tenantProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '180d':
        startDate.setDate(endDate.getDate() - 180);
        break;
      case '365d':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get analytics data for the product
    const analytics = await TenantAnalyticsEvents.findAll({
      where: {
        userId,
        productId,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      order: [['createdAt', 'ASC']],
    });

    // Get all forms for the product
    const forms = await TenantProductForm.findAll({
      where: {
        tenantProductId: productId,
      },
    });

    // Group analytics by form and event type
    const formAnalytics: Record<string, { views: number; conversions: number; formUrl: string }> = {};

    forms.forEach((form) => {
      const formData = form.toJSON();
      formAnalytics[formData.id] = {
        views: 0,
        conversions: 0,
        formUrl: formData.slug || '',
      };
    });

    analytics.forEach((event) => {
      const eventData = event.toJSON();
      if (formAnalytics[eventData.formId]) {
        if (eventData.eventType === 'view') {
          formAnalytics[eventData.formId].views++;
        } else if (eventData.eventType === 'conversion') {
          formAnalytics[eventData.formId].conversions++;
        }
      }
    });

    // Calculate conversion rates
    const formAnalyticsWithRates = Object.entries(formAnalytics).map(([formId, data]) => ({
      formId,
      views: data.views,
      conversions: data.conversions,
      conversionRate: data.views > 0 ? (data.conversions / data.views) * 100 : 0,
      formUrl: data.formUrl,
    }));

    // Calculate totals
    const totalViews = Object.values(formAnalytics).reduce((sum, data) => sum + data.views, 0);
    const totalConversions = Object.values(formAnalytics).reduce((sum, data) => sum + data.conversions, 0);
    const overallConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    return res.json({
      success: true,
      data: {
        productId,
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        summary: {
          totalViews,
          totalConversions,
          overallConversionRate,
        },
        forms: formAnalyticsWithRates,
      },
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product analytics',
    });
  }
});

// Get analytics for all products of a user
router.get('/analytics/overview', authenticateJWT, async (req: Request, res: Response) => {
  try {
    console.log('📊 [Analytics Overview] Request received');
    const { timeRange = '30d' } = req.query;
    const currentUser = getCurrentUser(req);
    const userId = currentUser?.id;

    console.log('📊 [Analytics Overview] User ID:', userId);
    console.log('📊 [Analytics Overview] Time Range:', timeRange);

    if (!userId) {
      console.log('❌ [Analytics Overview] No user ID found - unauthorized');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    console.log('📊 [Analytics Overview] Starting ensureDataAggregated...');
    // Ensure yesterday's data is aggregated
    await AnalyticsService.ensureDataAggregated();
    console.log('✅ [Analytics Overview] ensureDataAggregated completed');

    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '180d':
        startDate.setDate(endDate.getDate() - 180);
        break;
      case '365d':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    console.log('📊 [Analytics Overview] Fetching analytics events from DB...');
    console.log('📊 [Analytics Overview] Date range:', { startDate, endDate });
    
    // Get all analytics data for the user
    const analytics = await TenantAnalyticsEvents.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: TenantProduct,
          as: 'tenantProduct',
          attributes: ['id'], // TenantProduct doesn't have a name field
          include: [{
            model: Product,
            attributes: ['id', 'name'],
          }]
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    console.log(`📊 [Analytics Overview] Found ${analytics.length} analytics events`);

    // Group analytics by product
    const productAnalytics: Record<string, {
      productName: string;
      views: number;
      conversions: number;
    }> = {};

    analytics.forEach((event) => {
      const eventData = event.toJSON() as any;
      const productId = eventData.productId;
      const productName = eventData.tenantProduct?.product?.name || 'Unknown Product';

      if (!productAnalytics[productId]) {
        productAnalytics[productId] = {
          productName,
          views: 0,
          conversions: 0,
        };
      }

      if (eventData.eventType === 'view') {
        productAnalytics[productId].views++;
      } else if (eventData.eventType === 'conversion') {
        productAnalytics[productId].conversions++;
      }
    });

    // Calculate conversion rates
    const productAnalyticsWithRates = Object.entries(productAnalytics).map(([productId, data]) => ({
      productId,
      productName: data.productName,
      views: data.views,
      conversions: data.conversions,
      conversionRate: data.views > 0 ? (data.conversions / data.views) * 100 : 0,
    }));

    // Calculate totals
    const totalViews = Object.values(productAnalytics).reduce((sum, data) => sum + data.views, 0);
    const totalConversions = Object.values(productAnalytics).reduce((sum, data) => sum + data.conversions, 0);
    const overallConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

    console.log('📊 [Analytics Overview] Summary:', { totalViews, totalConversions, overallConversionRate });
    console.log(`📊 [Analytics Overview] Products count: ${productAnalyticsWithRates.length}`);
    console.log('✅ [Analytics Overview] Sending response');

    return res.json({
      success: true,
      data: {
        timeRange,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        summary: {
          totalViews,
          totalConversions,
          overallConversionRate,
        },
        products: productAnalyticsWithRates,
      },
    });
  } catch (error) {
    console.error('❌ [Analytics Overview] Error fetching overview analytics:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch overview analytics',
    });
  }
});

// ============= ADMIN ENDPOINTS FOR ANALYTICS MAINTENANCE =============

// Manually trigger daily aggregation
router.post('/admin/analytics/aggregate', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);

    // Only allow admin users
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    const { date } = req.body;

    await AnalyticsService.aggregateDailyAnalytics(date);

    return res.json({
      success: true,
      message: `Daily aggregation completed for ${date || 'yesterday'}`,
    });
  } catch (error) {
    console.error('Error triggering aggregation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger aggregation',
    });
  }
});

// Manually trigger retention policy
router.post('/admin/analytics/retention', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);

    // Only allow admin users
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    const { retentionDays = 365 } = req.body;

    const deletedCount = await AnalyticsService.applyRetentionPolicy(retentionDays);

    return res.json({
      success: true,
      message: `Deleted ${deletedCount} events older than ${retentionDays} days`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error applying retention policy:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to apply retention policy',
    });
  }
});

// Run full daily maintenance (aggregate + retention)
router.post('/admin/analytics/maintenance', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);

    // Only allow admin users
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    await AnalyticsService.runDailyMaintenance();

    return res.json({
      success: true,
      message: 'Daily maintenance completed successfully',
    });
  } catch (error) {
    console.error('Error running maintenance:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run maintenance',
    });
  }
});

// Backfill aggregations for a date range
router.post('/admin/analytics/backfill', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);

    // Only allow admin users
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required',
      });
    }

    await AnalyticsService.backfillDailyAggregations(startDate, endDate);

    return res.json({
      success: true,
      message: `Backfill completed for ${startDate} to ${endDate}`,
    });
  } catch (error) {
    console.error('Error running backfill:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run backfill',
    });
  }
});

// Check aggregation status
router.get('/admin/analytics/status', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const currentUser = getCurrentUser(req);

    // Only allow admin users
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required',
      });
    }

    // Get the most recent aggregation date
    const latestAggregation = await FormAnalyticsDaily.findOne({
      order: [['date', 'DESC']],
      attributes: ['date'],
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return res.json({
      success: true,
      data: {
        mode: 'on-demand',
        latestAggregationDate: latestAggregation?.date || null,
        yesterdayDate: yesterdayStr,
        isUpToDate: latestAggregation?.date === yesterdayStr,
      },
    });
  } catch (error) {
    console.error('Error checking aggregation status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check aggregation status',
    });
  }
});

export default router;

