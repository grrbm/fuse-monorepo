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
    scheduleUpdated?: boolean;
    immediateUpgrade?: boolean;
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

      console.log("currentSubscription ", JSON.stringify(currentSubscription.features))

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

      const subscriptionSchedule = currentSubscription?.features?.subscriptionSchedule;
      const stripeService = new StripeService();

      // If subscription has a schedule, check its status
      if (subscriptionSchedule?.id) {
        const subSchedule = await stripeService.getSubscriptionSchedule(subscriptionSchedule.id);
        console.log("subscriptionSchedule status:", subSchedule.status);

        if (subSchedule.status === 'active') {
          // Schedule is active - update the following phase
          console.log('📅 Subscription schedule is active - updating future phase');

          const phases = subSchedule.phases.map((phase, index, arr) => {
            // Update the last phase (future/ongoing plan) to use the new plan
            if (index === arr.length - 1) {
              return {
                items: [{
                  price: newPlan.stripePriceId,
                  quantity: 1
                }],
                start_date: phase.start_date,
                ...(phase.end_date && { end_date: phase.end_date })
              };
            }
            // Keep other phases unchanged - only include essential fields
            return {
              items: phase.items,
              start_date: phase.start_date,
              ...(phase.end_date && { end_date: phase.end_date })
            };
          }) as any;

          await stripeService.updateSubscriptionSchedule(subscriptionSchedule.id, {
            phases,
            proration_behavior: 'none'
          });

          // Update local subscription with new plan details
          await currentSubscription.update({
            planType: newPlan.planType,
            stripePriceId: newPlan.stripePriceId,
            monthlyPrice: newPlan.monthlyPrice,
            status: BrandSubscriptionStatus.PROCESSING
          });

          console.log('✅ Subscription schedule updated for future billing cycle');

          return {
            success: true,
            message: `Successfully scheduled upgrade to ${newPlan.name} for next billing cycle`,
            data: {
              subscription: currentSubscription,
              newPlan: newPlan,
              scheduleUpdated: true
            }
          };
        } else {
          console.log('📋 Subscription schedule is completed - performing direct subscription update');
        }
      }

      // Schedule is completed or doesn't exist - perform direct subscription update
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

      // Upgrade subscription in Stripe immediately
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
        status: BrandSubscriptionStatus.PROCESSING
      });

      console.log('✅ Brand subscription upgraded immediately:', {
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
          newPlan: newPlan,
          immediateUpgrade: true
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