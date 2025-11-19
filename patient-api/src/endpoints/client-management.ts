import { Express } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import BrandSubscription from '../models/BrandSubscription';
import BrandSubscriptionPlans from '../models/BrandSubscriptionPlans';

export function registerClientManagementEndpoints(app: Express, authenticateJWT: any, getCurrentUser: any) {
  
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
      for (const user of users) {
        if (user.brandSubscriptions) {
          for (const subscription of user.brandSubscriptions) {
            if (subscription.planType) {
              const plan = await BrandSubscriptionPlans.getPlanByType(subscription.planType);
              (subscription as any).plan = plan;
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        data: {
          users,
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
      if (targetUser.brandSubscriptions) {
        for (const subscription of targetUser.brandSubscriptions) {
          if (subscription.planType) {
            const plan = await BrandSubscriptionPlans.getPlanByType(subscription.planType);
            (subscription as any).plan = plan;
          }
        }
      }

      res.status(200).json({ success: true, data: targetUser });
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

      await brandSubscription.update(updates);

      // Attach plan data for response
      if (brandSubscription.planType) {
        const plan = await BrandSubscriptionPlans.getPlanByType(brandSubscription.planType);
        (brandSubscription as any).plan = plan;
      }

      res.status(200).json({
        success: true,
        message: 'BrandSubscription updated successfully',
        data: brandSubscription
      });
    } catch (error) {
      console.error('❌ Error updating BrandSubscription:', error);
      res.status(500).json({ success: false, message: 'Failed to update BrandSubscription' });
    }
  });
}

