import TreatmentPlan, { BillingInterval } from '../models/TreatmentPlan';
import Treatment from '../models/Treatment';
import User from '../models/User';
import StripeService from './stripe';

interface CreateTreatmentPlanData {
    name: string;
    description?: string;
    billingInterval: BillingInterval;
    price: number;
    active?: boolean;
    popular?: boolean;
    sortOrder?: number;
    treatmentId: string;
}

interface UpdateTreatmentPlanData {
    name?: string;
    description?: string;
    billingInterval?: BillingInterval;
    price?: number;
    active?: boolean;
    popular?: boolean;
    sortOrder?: number;
}

class TreatmentPlanService {
    private stripeService: StripeService;

    constructor() {
        this.stripeService = new StripeService();
    }

    async validateTreatmentPlanOperation(treatmentId: string, userId: string) {
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

    async createTreatmentPlan(planData: CreateTreatmentPlanData, userId: string) {
        // Validate treatment operation permission
        const { treatment } = await this.validateTreatmentPlanOperation(planData.treatmentId, userId);

        // Create treatment plan
        const treatmentPlan = await TreatmentPlan.create({
            name: planData.name,
            description: planData.description || '',
            billingInterval: planData.billingInterval,
            price: planData.price,
            active: planData.active !== undefined ? planData.active : true,
            popular: planData.popular || false,
            sortOrder: planData.sortOrder || 0,
            treatmentId: planData.treatmentId,
            stripePriceId: '' // Will be set by ensureStripePrice
        });

        // Ensure Stripe price exists
        await this.ensureStripePrice(treatmentPlan, treatment);

        return treatmentPlan;
    }

    async updateTreatmentPlan(planId: string, updateData: UpdateTreatmentPlanData, userId: string) {
        const treatmentPlan = await TreatmentPlan.findByPk(planId, {
            include: [
                {
                    model: Treatment,
                    as: 'treatment'
                }
            ]
        });

        if (!treatmentPlan) {
            throw new Error('Treatment plan not found');
        }

        // Validate treatment operation permission
        await this.validateTreatmentPlanOperation(treatmentPlan.treatmentId, userId);

        // Check if price or billing interval changed (requires new Stripe price)
        const priceChanged = updateData.price !== undefined && updateData.price !== treatmentPlan.price;
        const intervalChanged = updateData.billingInterval !== undefined && updateData.billingInterval !== treatmentPlan.billingInterval;

        // Update treatment plan
        const updatedPlan = await treatmentPlan.update({
            ...(updateData.name !== undefined && { name: updateData.name }),
            ...(updateData.description !== undefined && { description: updateData.description }),
            ...(updateData.billingInterval !== undefined && { billingInterval: updateData.billingInterval }),
            ...(updateData.price !== undefined && { price: updateData.price }),
            ...(updateData.active !== undefined && { active: updateData.active }),
            ...(updateData.popular !== undefined && { popular: updateData.popular }),
            ...(updateData.sortOrder !== undefined && { sortOrder: updateData.sortOrder })
        });

        // Create new Stripe price if price or billing interval changed
        if (priceChanged || intervalChanged) {
            // Deactivate the previous price first
            if (treatmentPlan.stripePriceId) {
                await this.stripeService.deprecatePrice(treatmentPlan.stripePriceId);
            }

            // Create new price
            await this.ensureStripePrice(updatedPlan, treatmentPlan.treatment);
        }

        return updatedPlan;
    }

    async deleteTreatmentPlan(planId: string, userId: string) {
        const treatmentPlan = await TreatmentPlan.findByPk(planId);

        if (!treatmentPlan) {
            throw new Error('Treatment plan not found');
        }

        // Validate treatment operation permission
        await this.validateTreatmentPlanOperation(treatmentPlan.treatmentId, userId);

        // Archive Stripe price instead of deleting (Stripe best practice)
        if (treatmentPlan.stripePriceId) {
            await this.stripeService.deprecatePrice(treatmentPlan.stripePriceId);
        }

        // Delete treatment plan
        await TreatmentPlan.destroy({
            where: { id: planId }
        });

        return { deleted: true, planId };
    }

    async listTreatmentPlans(treatmentId: string, userId: string) {
        // Validate treatment operation permission
        await this.validateTreatmentPlanOperation(treatmentId, userId);

        const treatmentPlans = await TreatmentPlan.findAll({
            where: { treatmentId },
            order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
        });

        return treatmentPlans;
    }

    private async ensureStripePrice(treatmentPlan: TreatmentPlan, treatment: Treatment) {
        if (treatmentPlan.price <= 0) {
            return;
        }

        // Get the billing interval mapping for Stripe
        const intervalMapping = {
            [BillingInterval.MONTHLY]: 'month',
            [BillingInterval.QUARTERLY]: 'month', // 3 months
            [BillingInterval.BIANNUAL]: 'month',  // 6 months
            [BillingInterval.ANNUAL]: 'year'
        };

        const intervalCountMapping = {
            [BillingInterval.MONTHLY]: 1,
            [BillingInterval.QUARTERLY]: 3,
            [BillingInterval.BIANNUAL]: 6,
            [BillingInterval.ANNUAL]: 1
        };

        // Ensure treatment has a Stripe product
        let stripeProductId = treatment.stripeProductId;
        if (!stripeProductId) {
            const stripeProduct = await this.stripeService.createProduct({
                name: treatment.name,
                description: `Treatment: ${treatment.name}`,
                metadata: {
                    treatmentId: treatment.id,
                    clinicId: treatment.clinicId
                }
            });
            stripeProductId = stripeProduct.id;

            // Update treatment with Stripe product ID
            await treatment.update({ stripeProductId });
        }

        // Create new Stripe price for this plan
        const stripePrice = await this.stripeService.createPrice({
            product: stripeProductId,
            unit_amount: Math.round(treatmentPlan.price * 100), // Convert to cents
            currency: 'usd',
            recurring: {
                interval: intervalMapping[treatmentPlan.billingInterval] as 'month' | 'year',
                interval_count: intervalCountMapping[treatmentPlan.billingInterval]
            },
            metadata: {
                treatmentPlanId: treatmentPlan.id,
                treatmentId: treatment.id,
                billingInterval: treatmentPlan.billingInterval
            }
        });

        // Update treatment plan with new Stripe price ID
        await treatmentPlan.update({ stripePriceId: stripePrice.id });
    }
}

export default TreatmentPlanService;