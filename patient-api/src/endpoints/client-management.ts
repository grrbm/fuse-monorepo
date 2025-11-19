import { Express } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import BrandSubscription from '../models/BrandSubscription';
import BrandSubscriptionPlans from '../models/BrandSubscriptionPlans';

export function registerClientManagementEndpoints(app: Express, authenticateJWT: any, getCurrentUser: any) {
  
  // Get all available subscription plans
  app.get("/admin/subscription-plans", authenticateJWT, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const plans = await BrandSubscriptionPlans.findAll({
        attributes: ['id', 'planType', 'name', 'description', 'maxProducts', 'monthlyPrice', 'isActive'],
        order: [['sortOrder', 'ASC'], ['name', 'ASC']]
      });

      res.status(200).json({ success: true, data: plans });
    } catch (error) {
      console.error('❌ Error fetching subscription plans:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch subscription plans' });
    }
  });

  // Get all users with their BrandSubscriptions
  app.get("/admin/users", authenticateJWT, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      // Only admins or tenant users can access this
      const user = await User.findByPk(currentUser.id);
      if (!user) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string || '';
      const role = req.query.role as string;

      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {};
      
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      const { rows: users, count } = await User.findAndCountAll({
        where: whereClause,
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'role',
          'activated',
          'businessType',
          'createdAt',
          'updatedAt',
        ],
        include: [{
          model: BrandSubscription,
          as: 'brandSubscriptions',
          required: false,
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      // Manually attach plan data to each subscription
      const usersWithPlans = await Promise.all(users.map(async (user) => {
        const userJson = user.toJSON();
        if (userJson.brandSubscriptions) {
          userJson.brandSubscriptions = await Promise.all(userJson.brandSubscriptions.map(async (subscription: any) => {
            if (subscription.planType) {
              console.log(`🔍 [Client Mgmt] Looking for plan with type: "${subscription.planType}"`);
              const plan = await BrandSubscriptionPlans.getPlanByType(subscription.planType);
              if (plan) {
                console.log(`✅ [Client Mgmt] Found plan:`, { id: plan.id, name: plan.name, maxProducts: plan.maxProducts });
                subscription.plan = plan.toJSON();
              } else {
                console.log(`❌ [Client Mgmt] Plan not found for type: "${subscription.planType}"`);
                subscription.plan = null;
              }
            }
            return subscription;
          }));
        }
        return userJson;
      }));

      res.status(200).json({
        success: true,
        data: {
          users: usersWithPlans,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
          }
        }
      });
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  });

  // Get a specific user with their BrandSubscription
  app.get("/admin/users/:userId", authenticateJWT, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await User.findByPk(currentUser.id);
      if (!user) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const { userId } = req.params;

      const targetUser = await User.findByPk(userId, {
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'role',
          'activated',
          'businessType',
          'phoneNumber',
          'createdAt',
          'updatedAt',
        ],
        include: [{
          model: BrandSubscription,
          as: 'brandSubscriptions',
          required: false,
        }],
      });

      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Manually attach plan data to subscriptions
      const userJson = targetUser.toJSON();
      if (userJson.brandSubscriptions) {
        userJson.brandSubscriptions = await Promise.all(userJson.brandSubscriptions.map(async (subscription: any) => {
          if (subscription.planType) {
            console.log(`🔍 [Client Mgmt] Looking for plan with type: "${subscription.planType}" for user ${userId}`);
            const plan = await BrandSubscriptionPlans.getPlanByType(subscription.planType);
            if (plan) {
              console.log(`✅ [Client Mgmt] Found plan:`, { id: plan.id, name: plan.name, maxProducts: plan.maxProducts });
              subscription.plan = plan.toJSON();
            } else {
              console.log(`❌ [Client Mgmt] Plan not found for type: "${subscription.planType}"`);
              subscription.plan = null;
            }
          }
          return subscription;
        }));
      }

      res.status(200).json({ success: true, data: userJson });
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  });

  // Update BrandSubscription settings
  app.patch("/admin/users/:userId/brand-subscription", authenticateJWT, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const user = await User.findByPk(currentUser.id);
      if (!user) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      const { userId } = req.params;
      const {
        productsChangedAmountOnCurrentCycle,
        retriedProductSelectionForCurrentCycle,
        tutorialFinished,
        customMaxProducts,
        planType,
      } = req.body;

      // Find the user's BrandSubscription
      const brandSubscription = await BrandSubscription.findOne({
        where: { userId }
      });

      if (!brandSubscription) {
        return res.status(404).json({
          success: false,
          message: 'BrandSubscription not found for this user'
        });
      }

      // Update only the fields that are provided
      const updates: any = {};
      
      if (typeof productsChangedAmountOnCurrentCycle === 'number') {
        updates.productsChangedAmountOnCurrentCycle = productsChangedAmountOnCurrentCycle;
      }
      
      if (typeof retriedProductSelectionForCurrentCycle === 'boolean') {
        updates.retriedProductSelectionForCurrentCycle = retriedProductSelectionForCurrentCycle;
      }
      
      if (typeof tutorialFinished === 'boolean') {
        updates.tutorialFinished = tutorialFinished;
      }

      // Allow setting customMaxProducts to null to use plan default
      if (customMaxProducts !== undefined) {
        updates.customMaxProducts = customMaxProducts === null || customMaxProducts === '' ? null : parseInt(customMaxProducts as string);
      }

      // Allow changing planType
      if (planType !== undefined && typeof planType === 'string' && planType.trim() !== '') {
        // Verify the plan exists
        const planExists = await BrandSubscriptionPlans.findOne({
          where: { planType: planType }
        });
        
        if (planExists) {
          updates.planType = planType;
        } else {
          return res.status(400).json({
            success: false,
            message: `Plan type '${planType}' does not exist`
          });
        }
      }

      console.log('💾 [Client Mgmt] Updating subscription with:', updates);
      await brandSubscription.update(updates);
      console.log('✅ [Client Mgmt] Updated subscription values:', {
        productsChangedAmountOnCurrentCycle: brandSubscription.productsChangedAmountOnCurrentCycle,
        retriedProductSelectionForCurrentCycle: brandSubscription.retriedProductSelectionForCurrentCycle,
        tutorialFinished: brandSubscription.tutorialFinished,
        customMaxProducts: brandSubscription.customMaxProducts,
        planType: brandSubscription.planType
      });

      // Attach plan data for response
      const subscriptionJson = brandSubscription.toJSON();
      if (subscriptionJson.planType) {
        const plan = await BrandSubscriptionPlans.getPlanByType(subscriptionJson.planType);
        if (plan) {
          (subscriptionJson as any).plan = plan.toJSON();
        }
      }

      res.status(200).json({
        success: true,
        message: 'BrandSubscription updated successfully',
        data: subscriptionJson
      });
    } catch (error) {
      console.error('❌ Error updating BrandSubscription:', error);
      res.status(500).json({ success: false, message: 'Failed to update BrandSubscription' });
    }
  });
}

