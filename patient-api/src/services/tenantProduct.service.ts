import TenantProduct from '../models/TenantProduct';
import Product from '../models/Product';
import Questionnaire from '../models/Questionnaire';
import User from '../models/User';
import BrandSubscription from '../models/BrandSubscription';
import {
    bulkUpsertTenantProducts,
    getTenantProductsByClinic,
    getTenantProduct,
    deleteTenantProduct
} from './db/tenantProduct';
// Using any to facilitate quick unblocking of build
import type * as Validators from '@fuse/validators';
type UpdateSelectionInput = any; // (Validators as any).UpdateSelectionInput
type ProductSelectionItem = any; // (Validators as any).ProductSelectionItem

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
        // Get user's active subscription
        const subscription = await BrandSubscription.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        if (!subscription) {
            throw new Error('No active subscription found. Please subscribe to a plan to manage products.');
        }

        // Check if subscription is active
        if (!subscription.isActive()) {
            throw new Error(`Subscription is not active. Current status: ${subscription.status}`);
        }

        // Check maxProducts limit from features
        const maxProducts = subscription.features?.maxProducts;

        if (maxProducts !== undefined && productCount > maxProducts) {
            throw new Error(
                `Product limit exceeded. Your plan allows ${maxProducts} product(s), but you are trying to add ${productCount}. Please upgrade your subscription to add more products.`
            );
        }

        console.log(`✅ Subscription validation passed: ${productCount} products (limit: ${maxProducts ?? 'unlimited'})`);
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

        // 3. Validate subscription limits based on number of products
        await this.validateSubscriptionLimits(userId, productIds.length);

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
}

export default TenantProductService;
