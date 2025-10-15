import TenantProduct from '../models/TenantProduct';
import Product from '../models/Product';
import Questionnaire from '../models/Questionnaire';
import User from '../models/User';
import BrandSubscription, { BrandSubscriptionStatus } from '../models/BrandSubscription';
import BrandSubscriptionPlans from '../models/BrandSubscriptionPlans';
import Clinic from '../models/Clinic';
import { StripeService } from '@fuse/stripe';
import {
    bulkUpsertTenantProducts,
    getTenantProductsByClinic,
    getTenantProduct,
    deleteTenantProduct
} from './db/tenantProduct';
import { UpdateSelectionInput } from '@fuse/validators';

class TenantProductService {
    /**
     * Validates that the user has permission to manage tenant products
     */
    async validateUserPermission(userId: string): Promise<{ user: User; clinicId: string }> {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.clinicId) {
            throw new Error('User does not belong to a clinic');
        }

        // Check user role - only brand/admin users can manage tenant products
        if (user.role !== 'brand' && user.role !== 'admin') {
            throw new Error('Unauthorized: Only brand or admin users can manage tenant products');
        }

        return { user, clinicId: user.clinicId };
    }

    /**
     * Validates that products exist and are active
     */
    async validateProducts(productIds: any[]): Promise<Map<string, Product>> {
        const products = await Product.findAll({
            where: {
                id: productIds as any
            }
        });

        if (products.length !== productIds.length) {
            const foundIds = products.map(p => p.id);
            const missingIds = productIds.filter(id => !foundIds.includes(id));
            throw new Error(`Products not found: ${missingIds.join(', ')}`);
        }

        // Note: Products don't have an 'active' field in the current schema
        // If you need to check for active products, add that field to the Product model

        const productMap = new Map<string, Product>();
        products.forEach((product: any) => {
            productMap.set(product.id as string, product as Product);
        });

        return productMap;
    }

    /**
     * Validates that questionnaires exist and belong to the clinic
     */
    async validateQuestionnaires(
        questionnaireIds: string[]
    ): Promise<Map<string, Questionnaire>> {
        const questionnaires = await Questionnaire.findAll({
            where: {
                id: questionnaireIds as any
            }
        });

        if (questionnaires.length !== questionnaireIds.length) {
            const foundIds = questionnaires.map(q => q.id);
            const missingIds = questionnaireIds.filter(id => !foundIds.includes(id));
            throw new Error(`Questionnaires not found: ${missingIds.join(', ')}`);
        }



        const questionnaireMap = new Map<string, Questionnaire>();
        questionnaires.forEach((questionnaire: any) => {
            questionnaireMap.set(questionnaire.id as string, questionnaire as Questionnaire);
        });

        return questionnaireMap;
    }

    /**
     * Validates that the number of products doesn't exceed subscription limits
     */
    async validateSubscriptionLimits(userId: string, productCount: number): Promise<void> {
        // Get user's latest ACTIVE subscription
        const subscription = await BrandSubscription.findOne({
            where: { userId, status: BrandSubscriptionStatus.ACTIVE },
            order: [['createdAt', 'DESC']]
        });

        if (!subscription) {
            throw new Error('No active subscription found. Please subscribe to a plan to manage products.');
        }

        // Determine maxProducts: prefer features.maxProducts; fallback to plan by planType
        let maxProducts: number | undefined = subscription.features?.maxProducts;
        if (typeof maxProducts !== 'number') {
            if (subscription.planType) {
                const plan = await BrandSubscriptionPlans.findOne({ where: { planType: subscription.planType } });
                if (plan) {
                    maxProducts = plan.maxProducts;
                }
            }
        }

        // If still undefined, treat as unlimited
        if (typeof maxProducts !== 'number') {
            console.log(`ℹ️ No maxProducts configured; treating as unlimited.`);
            return;
        }

        // -1 means unlimited products
        if (maxProducts === -1) {
            console.log(`✅ Subscription validation passed: ${productCount} products (limit: unlimited)`);
            return;
        }

        if (productCount > maxProducts) {
            throw new Error(
                `Product limit exceeded. Your plan allows ${maxProducts} product(s), but you are trying to enable ${productCount}. Please upgrade your subscription to add more products.`
            );
        }

        console.log(`✅ Subscription validation passed: ${productCount} products (limit: ${maxProducts})`);
    }

    /**
     * Updates the product selection for a clinic
     * This method will validate products and questionnaires, then upsert the tenant products
     */
    async updateSelection(data: UpdateSelectionInput, userId: string) {
        // 1. Validate user permission and get clinic ID
        const { clinicId } = await this.validateUserPermission(userId);

        // 2. Extract unique product IDs and questionnaire IDs
        const productIds = [...new Set((data as any).products.map((p: any) => p.productId))] as any[];
        const questionnaireIds = [...new Set((data as any).products.map((p: any) => p.questionnaireId))] as any[];

        // 3. Enforce change-once-per-billing-cycle and validate subscription limits
        const subscription = await BrandSubscription.findOne({
            where: { userId, status: BrandSubscriptionStatus.ACTIVE },
            order: [['createdAt', 'DESC']]
        });
        if (!subscription) {
            throw new Error('No active subscription found. Please subscribe to a plan to manage products.');
        }

        // Change once per billing cycle check
        const now = new Date();
        const periodStart = subscription.currentPeriodStart ? new Date(subscription.currentPeriodStart) : null;
        const periodEnd = subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null;

        // Reset counter at cycle start, if needed
        if (periodStart && subscription.lastProductChangeAt && subscription.lastProductChangeAt < periodStart) {
            try {
                await subscription.update({ productsChangedAmountOnCurrentCycle: 0 } as any)
            } catch { }
        }

        // Removed: once-per-cycle enforcement to allow changes up to plan limit
        // if (periodStart && periodEnd && subscription.lastProductChangeAt && subscription.lastProductChangeAt >= periodStart && subscription.lastProductChangeAt < periodEnd) {
        //     const nextChangeDate = periodEnd.toISOString();
        //     throw new Error(`You can only change products once per billing cycle. Try again after ${nextChangeDate}.`);
        // }

        // Validate subscription limits based on final total products (existing + incoming)
        const existing = await getTenantProductsByClinic(clinicId);
        const existingProductIds = new Set<string>(existing.map(tp => tp.productId));
        const finalProductIds = new Set<string>([...existingProductIds, ...productIds as string[]]);
        await this.validateSubscriptionLimits(userId, finalProductIds.size);

        // 4. Validate products exist
        await this.validateProducts(productIds);

        // 5. Validate questionnaires exist and belong to clinic
        await this.validateQuestionnaires(questionnaireIds);

        // 6. Check for duplicate product entries in the input
        const productIdCounts = new Map<string, number>();
        (data as any).products.forEach((item: any) => {
            const count = productIdCounts.get(item.productId as string) || 0;
            productIdCounts.set(item.productId as string, count + 1);
        });

        const duplicates = Array.from(productIdCounts.entries())
            .filter(([_, count]) => count > 1)
            .map(([productId, _]) => productId);

        if (duplicates.length > 0) {
            throw new Error(`Duplicate products in selection: ${duplicates.join(', ')}`);
        }

        // 7. Prepare data for bulk upsert
        const productsToUpsert = data.products.map(item => ({
            productId: item.productId,
            questionnaireId: item.questionnaireId,
        }));

        // 8. Bulk upsert tenant products
        const tenantProducts = await bulkUpsertTenantProducts(clinicId, productsToUpsert);

        // 9. Return the created/updated tenant products with full relations
        const result = await Promise.all(
            tenantProducts.map(tp => getTenantProduct(tp.id))
        );

        // 10. Mark last change timestamp on subscription (features JSONB)
        try {
            await subscription.update({
                lastProductChangeAt: new Date(),
                productsChangedAmountOnCurrentCycle: (subscription.productsChangedAmountOnCurrentCycle || 0) + 1,
            } as any)
        } catch (e) {
            console.warn('Failed to update product change tracking fields on subscription', e);
        }

        return result.filter((tp): tp is TenantProduct => tp !== null);
    }

    /**
     * Lists all tenant products for a clinic
     */
    async listByClinic(userId: string) {
        const { clinicId } = await this.validateUserPermission(userId);
        return getTenantProductsByClinic(clinicId);
    }

    /**
     * Deletes a tenant product
     */
    async delete(tenantProductId: string, userId: string) {
        const { clinicId } = await this.validateUserPermission(userId);

        const tenantProduct = await getTenantProduct(tenantProductId);
        if (!tenantProduct) {
            throw new Error('Tenant product not found');
        }

        if (tenantProduct.clinicId !== clinicId) {
            throw new Error('Tenant product does not belong to your clinic');
        }

        await deleteTenantProduct(tenantProductId);

        return { deleted: true, tenantProductId };
    }

    /**
     * Updates the price of a tenant product
     * Creates Stripe product and price IDs if not found
     */
    async updatePrice(params: {
        tenantProductId: string;
        price: number;
        userId: string;
    }): Promise<{
        success: boolean;
        tenantProduct?: TenantProduct;
        stripeProductId?: string;
        stripePriceId?: string;
        error?: string;
        message?: string;
    }> {
        const { tenantProductId, price, userId } = params;

        try {
            // Validate user permission
            const { clinicId } = await this.validateUserPermission(userId);

            // Get tenant product with relations
            const tenantProduct = await TenantProduct.findByPk(tenantProductId, {
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true
                    },
                    {
                        model: Clinic,
                        as: 'clinic',
                        required: false
                    }
                ]
            });

            if (!tenantProduct) {
                return { success: false, error: 'Tenant product not found' };
            }

            // Verify tenant product belongs to user's clinic
            if (tenantProduct.clinicId !== clinicId) {
                return { success: false, error: 'Tenant product does not belong to your clinic' };
            }

            if (!tenantProduct.product) {
                return { success: false, error: 'Product not found for tenant product' };
            }

            const product = tenantProduct.product;
            const oldPrice = tenantProduct.price;
            const baseProductPrice = product.price;

            // Validate that tenant price is not less than base product price
            if (price < baseProductPrice) {
                const error = `Tenant product price ($${price}) cannot be less than base product price ($${baseProductPrice})`;
                console.error('❌', error);
                return { success: false, error };
            }

            // Check if price is actually changing
            if (oldPrice === price) {
                console.log('ℹ️ Price unchanged, skipping update:', {
                    tenantProductId,
                    currentPrice: oldPrice,
                    requestedPrice: price
                });

                return {
                    success: true,
                    tenantProduct,
                    stripeProductId: tenantProduct.stripeProductId,
                    stripePriceId: undefined, // No new price created
                    message: 'Price unchanged'
                };
            }

            console.log('💰 Price change detected:', {
                tenantProductId,
                oldPrice,
                newPrice: price,
                baseProductPrice
            });

            const stripeService = new StripeService();

            // Step 1: Create or get Stripe product
            let stripeProductId = tenantProduct.stripeProductId;
            if (!stripeProductId) {
                console.log('📦 Creating Stripe product for tenant product:', tenantProductId);

                const stripeProduct = await stripeService.createProduct({
                    name: `${product.name} - ${tenantProduct.clinic?.name || 'Subscription'}`,
                    description: product.description,
                    metadata: {
                        productId: product.id,
                        tenantProductId: tenantProduct.id,
                        clinicId: tenantProduct.clinicId
                    }
                });

                stripeProductId = stripeProduct.id;
                await tenantProduct.update({ stripeProductId });

                console.log('✅ Stripe product created:', stripeProductId);
            } else {
                console.log('✅ Using existing Stripe product:', stripeProductId);
            }

            // Step 2: Create new Stripe price (prices are immutable in Stripe)
            console.log('💰 Creating Stripe price for tenant product:', tenantProductId);

            const stripePrice = await stripeService.createPrice({
                product: stripeProductId,
                currency: 'usd',
                unit_amount: Math.round(price * 100), // Convert to cents
                recurring: {
                    interval: 'month',
                    interval_count: 1
                },
                metadata: {
                    productId: product.id,
                    tenantProductId: tenantProduct.id,
                    clinicId: tenantProduct.clinicId,
                    priceType: 'base_price'
                }
            });

            console.log('✅ Stripe price created:', stripePrice.id);

            // Step 3: Update tenant product with new price
            await tenantProduct.update({ price, stripePriceId: stripePrice.id });

            console.log('✅ Tenant product price updated:', {
                tenantProductId,
                oldPrice,
                newPrice: price,
                stripeProductId,
                stripePriceId: stripePrice.id
            });

            // Reload to get updated values
            await tenantProduct.reload();

            return {
                success: true,
                tenantProduct,
                stripeProductId,
                stripePriceId: stripePrice.id
            };
        } catch (error) {
            console.error('❌ Error updating tenant product price:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: errorMessage };
        }
    }
}

export default TenantProductService;
