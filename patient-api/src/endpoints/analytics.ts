import { Router, Request, Response } from "express";
import TenantAnalyticsEvents from "../models/TenantAnalyticsEvents";
import TenantProduct from "../models/TenantProduct";
import Product from "../models/Product";
import FormAnalyticsDaily from "../models/FormAnalyticsDaily";
import TenantProductForm from "../models/TenantProductForm";
import GlobalFormStructure from "../models/GlobalFormStructure";
import { authenticateJWT, getCurrentUser } from "../config/jwt";
import { Op } from "sequelize";
import AnalyticsService from "../services/analytics.service";

const router = Router();

// Track analytics event (view, conversion, or dropoff)
router.post("/analytics/track", async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("📊 [Analytics API] Received tracking request");
    }

    const {
      userId,
      productId,
      formId,
      eventType,
      sessionId,
      dropOffStage,
      metadata,
    } = req.body;

    if (!userId || !productId || !formId || !eventType) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ [Analytics API] Missing required fields");
      }
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, productId, formId, eventType",
      });
    }

    if (!["view", "conversion", "dropoff"].includes(eventType)) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ [Analytics API] Invalid eventType");
      }
      return res.status(400).json({
        success: false,
        error: 'eventType must be either "view", "conversion", or "dropoff"',
      });
    }

    // Validate dropOffStage if eventType is 'dropoff'
    if (eventType === "dropoff" && !dropOffStage) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "❌ [Analytics API] Missing dropOffStage for dropoff event"
        );
      }
      return res.status(400).json({
        success: false,
        error: "dropOffStage is required for dropoff events",
      });
    }

    if (
      eventType === "dropoff" &&
      !["product", "payment", "account"].includes(dropOffStage)
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ [Analytics API] Invalid dropOffStage");
      }
      return res.status(400).json({
        success: false,
        error: "dropOffStage must be one of: product, payment, account",
      });
    }

    const analyticsEvent = await TenantAnalyticsEvents.create({
      userId,
      productId,
      formId,
      eventType,
      sessionId,
      dropOffStage: eventType === "dropoff" ? dropOffStage : null,
      metadata,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("✅ [Analytics API] Analytics event created");
    }

    return res.json({
      success: true,
      data: analyticsEvent.toJSON(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ [Analytics API] Error tracking analytics");
    }
    return res.status(500).json({
      success: false,
      error: "Failed to track analytics event",
    });
  }
});

// Get analytics for a specific product
router.get(
  "/analytics/products/:productId",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const timeRange = (req.query.timeRange as string) || "30d";
      const currentUser = getCurrentUser(req);
      const userId = currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      // Ensure yesterday's data is aggregated
      await AnalyticsService.ensureDataAggregated();

      // Verify the tenant product belongs to the user
      const tenantProduct = await TenantProduct.findOne({
        where: {
          id: productId,
        },
        include: [
          {
            model: Product,
            required: true,
          },
        ],
      });

      if (!tenantProduct) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "1d":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "180d":
          startDate.setDate(endDate.getDate() - 180);
          break;
        case "365d":
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
        order: [["createdAt", "ASC"]],
      });

      // Get unique form IDs
      const formIds = [...new Set(analytics.map((event) => event.formId))];

      // Fetch all form details in one query
      const forms = await TenantProductForm.findAll({
        where: {
          id: {
            [Op.in]: formIds,
          },
        },
        include: [
          {
            model: GlobalFormStructure,
            as: "globalFormStructure",
            attributes: ["structureId", "name"],
          },
        ],
      });

      // Create a map of formId -> form details
      const formDetailsMap = new Map(
        forms.map((form) => [
          form.id,
          {
            structureName:
              form.globalFormStructure?.name || "Unknown Structure",
            structureId: form.globalFormStructureId || "unknown",
          },
        ])
      );

      // Group analytics by form and event type
      const formAnalytics: Record<
        string,
        {
          views: number;
          conversions: number;
          productDropOffs: number;
          paymentDropOffs: number;
          accountDropOffs: number;
          formUrl: string;
        }
      > = {};

      // Process analytics events
      analytics.forEach((event) => {
        const eventData = event.toJSON();
        const formId = eventData.formId;

        if (!formAnalytics[formId]) {
          const formDetails = formDetailsMap.get(formId);
          const productName = eventData.metadata?.productName || "";

          const formLabel = formDetails
            ? `${productName} - ${formDetails.structureName}`
            : productName
              ? `${productName} Form (${formId.slice(0, 8)}...)`
              : `Form ${formId.slice(0, 8)}...`;

          formAnalytics[formId] = {
            views: 0,
            conversions: 0,
            productDropOffs: 0,
            paymentDropOffs: 0,
            accountDropOffs: 0,
            formUrl: formLabel,
          };
        }

        if (eventData.eventType === "view") {
          formAnalytics[formId].views++;
        } else if (eventData.eventType === "conversion") {
          formAnalytics[formId].conversions++;
        } else if (eventData.eventType === "dropoff") {
          if (eventData.dropOffStage === "product") {
            formAnalytics[formId].productDropOffs++;
          } else if (eventData.dropOffStage === "payment") {
            formAnalytics[formId].paymentDropOffs++;
          } else if (eventData.dropOffStage === "account") {
            formAnalytics[formId].accountDropOffs++;
          }
        }
      });

      const formAnalyticsWithRates = Object.entries(formAnalytics).map(
        ([formId, data]) => {
          const totalDropOffs =
            data.productDropOffs + data.paymentDropOffs + data.accountDropOffs;

          return {
            formId,
            views: data.views,
            conversions: data.conversions,
            conversionRate:
              data.views > 0 ? (data.conversions / data.views) * 100 : 0,
            formUrl: data.formUrl,
            dropOffs: {
              product: data.productDropOffs,
              payment: data.paymentDropOffs,
              account: data.accountDropOffs,
              total: totalDropOffs,
            },
            dropOffRates: {
              product:
                data.views > 0 ? (data.productDropOffs / data.views) * 100 : 0,
              payment:
                data.views > 0 ? (data.paymentDropOffs / data.views) * 100 : 0,
              account:
                data.views > 0 ? (data.accountDropOffs / data.views) * 100 : 0,
            },
          };
        }
      );

      const totalViews = Object.values(formAnalytics).reduce(
        (sum, data) => sum + data.views,
        0
      );
      const totalConversions = Object.values(formAnalytics).reduce(
        (sum, data) => sum + data.conversions,
        0
      );
      const totalProductDropOffs = Object.values(formAnalytics).reduce(
        (sum, data) => sum + data.productDropOffs,
        0
      );
      const totalPaymentDropOffs = Object.values(formAnalytics).reduce(
        (sum, data) => sum + data.paymentDropOffs,
        0
      );
      const totalAccountDropOffs = Object.values(formAnalytics).reduce(
        (sum, data) => sum + data.accountDropOffs,
        0
      );
      const overallConversionRate =
        totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

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
            dropOffs: {
              product: totalProductDropOffs,
              payment: totalPaymentDropOffs,
              account: totalAccountDropOffs,
              total:
                totalProductDropOffs +
                totalPaymentDropOffs +
                totalAccountDropOffs,
            },
            dropOffRates: {
              product:
                totalViews > 0 ? (totalProductDropOffs / totalViews) * 100 : 0,
              payment:
                totalViews > 0 ? (totalPaymentDropOffs / totalViews) * 100 : 0,
              account:
                totalViews > 0 ? (totalAccountDropOffs / totalViews) * 100 : 0,
            },
          },
          forms: formAnalyticsWithRates,
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching product analytics");
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch product analytics",
      });
    }
  }
);

// Get analytics for all products of a user
router.get(
  "/analytics/overview",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const timeRange = (req.query.timeRange as string) || "30d";
      const currentUser = getCurrentUser(req);
      const userId = currentUser?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      await AnalyticsService.ensureDataAggregated();

      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "1d":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "180d":
          startDate.setDate(endDate.getDate() - 180);
          break;
        case "365d":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

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
            as: "tenantProduct",
            attributes: ["id"],
            include: [
              {
                model: Product,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      const productAnalytics: Record<
        string,
        {
          productName: string;
          views: number;
          conversions: number;
        }
      > = {};

      analytics.forEach((event) => {
        const eventData = event.toJSON() as any;
        const productId = eventData.productId;
        const productName =
          eventData.tenantProduct?.product?.name || "Unknown Product";

        if (!productAnalytics[productId]) {
          productAnalytics[productId] = {
            productName,
            views: 0,
            conversions: 0,
          };
        }

        if (eventData.eventType === "view") {
          productAnalytics[productId].views++;
        } else if (eventData.eventType === "conversion") {
          productAnalytics[productId].conversions++;
        }
      });

      const productAnalyticsWithRates = Object.entries(productAnalytics).map(
        ([productId, data]) => ({
          productId,
          productName: data.productName,
          views: data.views,
          conversions: data.conversions,
          conversionRate:
            data.views > 0 ? (data.conversions / data.views) * 100 : 0,
        })
      );

      const totalViews = Object.values(productAnalytics).reduce(
        (sum, data) => sum + data.views,
        0
      );
      const totalConversions = Object.values(productAnalytics).reduce(
        (sum, data) => sum + data.conversions,
        0
      );
      const overallConversionRate =
        totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

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
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ [Analytics Overview] Error fetching overview analytics"
        );
      }
      return res.status(500).json({
        success: false,
        error: "Failed to fetch overview analytics",
      });
    }
  }
);

// ============= ADMIN ENDPOINTS FOR ANALYTICS MAINTENANCE =============

// Manually trigger daily aggregation
router.post(
  "/admin/analytics/aggregate",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Admin access required",
        });
      }

      const { date } = req.body;

      await AnalyticsService.aggregateDailyAnalytics(date);

      return res.json({
        success: true,
        message: `Daily aggregation completed for ${date || "yesterday"}`,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error triggering aggregation");
      }
      return res.status(500).json({
        success: false,
        error: "Failed to trigger aggregation",
      });
    }
  }
);

// Manually trigger retention policy
router.post(
  "/admin/analytics/retention",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Admin access required",
        });
      }

      const { retentionDays = 365 } = req.body;

      const deletedCount =
        await AnalyticsService.applyRetentionPolicy(retentionDays);

      return res.json({
        success: true,
        message: `Deleted ${deletedCount} events older than ${retentionDays} days`,
        deletedCount,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error applying retention policy");
      }
      return res.status(500).json({
        success: false,
        error: "Failed to apply retention policy",
      });
    }
  }
);

// Run full daily maintenance (aggregate + retention)
router.post(
  "/admin/analytics/maintenance",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Admin access required",
        });
      }

      await AnalyticsService.runDailyMaintenance();

      return res.json({
        success: true,
        message: "Daily maintenance completed successfully",
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error running maintenance");
      }
      return res.status(500).json({
        success: false,
        error: "Failed to run maintenance",
      });
    }
  }
);

// Backfill aggregations for a date range
router.post(
  "/admin/analytics/backfill",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Admin access required",
        });
      }

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate are required",
        });
      }

      await AnalyticsService.backfillDailyAggregations(startDate, endDate);

      return res.json({
        success: true,
        message: `Backfill completed for ${startDate} to ${endDate}`,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error running backfill");
      }
      return res.status(500).json({
        success: false,
        error: "Failed to run backfill",
      });
    }
  }
);

// Check aggregation status
router.get(
  "/admin/analytics/status",
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const currentUser = getCurrentUser(req);

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Admin access required",
        });
      }

      const latestAggregation = await FormAnalyticsDaily.findOne({
        order: [["date", "DESC"]],
        attributes: ["date"],
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      return res.json({
        success: true,
        data: {
          mode: "on-demand",
          latestAggregationDate: latestAggregation?.date || null,
          yesterdayDate: yesterdayStr,
          isUpToDate: latestAggregation?.date === yesterdayStr,
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error checking aggregation status");
      }
      return res.status(500).json({
        success: false,
        error: "Failed to check aggregation status",
      });
    }
  }
);

export default router;
