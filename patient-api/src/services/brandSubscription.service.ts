import BrandSubscription, { BrandSubscriptionStatus } from '../models/BrandSubscription';
import BrandSubscriptionPlans from '../models/BrandSubscriptionPlans';
import User from '../models/User';
import StripeService from './stripe';

interface UpgradeSubscriptionResult {
  success: boolean;
  message?: string;
  data?: {
    subscription: BrandSubscription;
    newPlan: BrandSubscriptionPlans;
  };
  error?: string;
}

class BrandSubscriptionService {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = new StripeService();
  }

  /**
   * Upgrade a brand subscription to a new plan
   */
  async upgradeSubscription(userId: string, newPlanId: string): Promise<UpgradeSubscriptionResult> {
    try {
      // Find the user's current brand subscription
      const currentSubscription = await BrandSubscription.findOne({
        where: {
          userId: userId,
          status: BrandSubscriptionStatus.ACTIVE
        }
      });

      if (!currentSubscription) {
        return {
          success: false,
          error: "No active brand subscription found for user"
        };
      }

      // Find the new plan by ID
      const newPlan = await BrandSubscriptionPlans.findByPk(newPlanId);

      if (!newPlan) {
        return {
          success: false,
          error: "New subscription plan not found"
        };
      }

      // Check if user is trying to "upgrade" to the same plan
      if (currentSubscription.planType === newPlan.planType) {
        return {
          success: false,
          error: "User is already on the selected plan"
        };
      }

      // Check if subscription has Stripe data for upgrade
      if (!currentSubscription.stripeSubscriptionId) {
        return {
          success: false,
          error: "Subscription is not connected to Stripe"
        };
      }

      // Get the current Stripe subscription to find the item ID
      const stripeSubscription = await this.stripeService.getSubscription(currentSubscription.stripeSubscriptionId);

      if (!stripeSubscription || !stripeSubscription.items.data.length) {
        return {
          success: false,
          error: "Unable to find Stripe subscription details"
        };
      }
      // Find the subscription item that doesn't match the new price ID (the one to replace)
      const itemToReplace = stripeSubscription.items.data.find(item =>
        item.price.id !== newPlan.stripePriceId
      );

      if (!itemToReplace) {
        throw new Error('No subscription item found to replace - subscription may already be using the target price');
      }

      const stripeItemId = itemToReplace.id;

      // Upgrade subscription in Stripe
      await this.stripeService.upgradeSubscriptionStripe({
        stripeSubscriptionId: currentSubscription.stripeSubscriptionId,
        stripeItemId,
        stripePriceId: newPlan.stripePriceId
      });

      // Update the subscription with new plan details
      await currentSubscription.update({
        planType: newPlan.planType,
        stripePriceId: newPlan.stripePriceId,
        monthlyPrice: newPlan.monthlyPrice,
        // Reset status to processing while change is being applied
        status: BrandSubscriptionStatus.PROCESSING
      });

      console.log('✅ Brand subscription upgraded:', {
        userId: userId,
        subscriptionId: currentSubscription.id,
        oldPlan: currentSubscription.planType,
        newPlan: newPlan.planType
      });

      return {
        success: true,
        message: `Successfully upgraded subscription to ${newPlan.name}`,
        data: {
          subscription: currentSubscription,
          newPlan: newPlan
        }
      };

    } catch (error) {
      console.error('❌ Error upgrading brand subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user's current brand subscription
   */
  async getCurrentSubscription(userId: string): Promise<BrandSubscription | null> {
    try {
      return await BrandSubscription.findOne({
        where: { userId: userId },
        include: [{ model: User, as: 'user' }],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error('❌ Error getting current subscription:', error);
      return null;
    }
  }

  /**
   * Get all available brand subscription plans
   */
  async getAvailablePlans(): Promise<BrandSubscriptionPlans[]> {
    try {
      return await BrandSubscriptionPlans.findAll({
        order: [['monthlyPrice', 'ASC']]
      });
    } catch (error) {
      console.error('❌ Error getting available plans:', error);
      return [];
    }
  }
}

export default BrandSubscriptionService;