import Subscription from '../models/Subscription';
import TreatmentPlan from '../models/TreatmentPlan';
import Order from '../models/Order';
import Treatment from '../models/Treatment';
import User from '../models/User';
import StripeService from './stripe';

class SubscriptionService {
    private stripeService: StripeService;

    constructor() {
        this.stripeService = new StripeService();
    }

    async validateTreatmentAccess(treatmentId: string, userId: string) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const treatment = await Treatment.findByPk(treatmentId);
        if (!treatment) {
            throw new Error('Treatment not found');
        }

        if (treatment.clinicId !== user.clinicId) {
            throw new Error('Treatment does not belong to your clinic');
        }

        return { user, treatment };
    }
    async upgradeSubscription(treatmentId: string, userId: string) {
        // Validate treatment access
        await this.validateTreatmentAccess(treatmentId, userId);

        const subs = await this.listByTreatmentId(treatmentId)

        // TODO: Migrate this into a queue

        for (const sub of subs) {
            // Then update the subscription using the new treatment plan from order
            await this.updateSubscription(sub.id);
        }
    }
    async listByTreatmentId(treatmentId: string): Promise<Subscription[]> {
        return Subscription.findAll({
            include: [
                {
                    model: Order,
                    as: 'order',
                    where: {
                        treatmentId: treatmentId,
                        status: 'paid'
                    },
                    required: true
                },
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async updateSubscription(subscriptionId: string) {
        const subscription = await Subscription.findByPk(subscriptionId, {
            include: [
                {
                    model: Order,
                    as: 'order',
                    include: [
                        {
                            model: TreatmentPlan,
                            as: 'treatmentPlan'
                        }
                    ]
                },
            ],
        });

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (!subscription.stripeSubscriptionId) {
            throw new Error('Subscription does not have a valid Stripe subscription ID');
        }

        if (!subscription.order) {
            throw new Error('Subscription does not have an associated order');
        }

        if (!subscription.order.treatmentPlan) {
            throw new Error('Order does not have an associated treatment plan');
        }

        const newTreatmentPlan = subscription.order.treatmentPlan;

        // Get current Stripe subscription to find the subscription item ID
        const stripeSub = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);

        if (!stripeSub.items.data.length) {
            throw new Error('No subscription items found in Stripe subscription');
        }

        const stripePriceId = newTreatmentPlan.stripePriceId;

        // Find the subscription item that doesn't match the new price ID (the one to replace)
        const itemToReplace = stripeSub.items.data.find(item =>
            item.price.id !== stripePriceId
        );

        if (!itemToReplace) {
            throw new Error('No subscription item found to replace - subscription may already be using the target price');
        }

        const stripeItemId = itemToReplace.id;

        await this.stripeService.upgradeSubscriptionStripe({
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            stripeItemId,
            stripePriceId
        });

    }

    async cancelSubscription(subscriptionId: string): Promise<Subscription | null> {
        const subscription = await Subscription.findByPk(subscriptionId);

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        if (!subscription.stripeSubscriptionId) {
            throw new Error('Subscription does not have a valid Stripe subscription ID');
        }

        // Cancel subscription in Stripe
        const stripeSub = await this.stripeService.getSubscription(subscription.stripeSubscriptionId);

        if (stripeSub.status !== 'canceled') {
            await this.stripeService.cancelSubscription(subscription.stripeSubscriptionId);
        }

        // Update local subscription status
        await subscription.markSubAsDeleted();

        return subscription;
    }


    async cancelSubscriptions(treatmentId: string, userId: string) {
        // Validate treatment access
        await this.validateTreatmentAccess(treatmentId, userId);

        const activeSubscriptions = await this.listByTreatmentId(treatmentId);

        // TODO: Migrate this into a queue
        for (const subscription of activeSubscriptions) {
            await this.cancelSubscription(subscription.id);
        }
    }
}

export default SubscriptionService;