import TenantProduct from '../models/TenantProduct';
import Product from '../models/Product';
import Questionnaire from '../models/Questionnaire';
import User from '../models/User';
import {
    bulkUpsertTenantProducts,
    getTenantProductsByClinic,
    getTenantProduct,
    deleteTenantProduct
} from './db/tenantProduct';
import type { UpdateSelectionInput, ProductSelectionItem } from '@fuse/validators';

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
    async validateProducts(productIds: string[]): Promise<Map<string, Product>> {
        const products = await Product.findAll({
            where: {
                id: productIds
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
        products.forEach(product => {
            productMap.set(product.id, product);
        });

        return productMap;
    }

    /**
     * Validates that questionnaires exist and belong to the clinic
     */
    async validateQuestionnaires(
        questionnaireIds: string[],
        clinicId: string
    ): Promise<Map<string, Questionnaire>> {
        const questionnaires = await Questionnaire.findAll({
            where: {
                id: questionnaireIds
            }
        });

        if (questionnaires.length !== questionnaireIds.length) {
            const foundIds = questionnaires.map(q => q.id);
            const missingIds = questionnaireIds.filter(id => !foundIds.includes(id));
            throw new Error(`Questionnaires not found: ${missingIds.join(', ')}`);
        }

        // Validate that questionnaires belong to the clinic or are templates
        const invalidQuestionnaires = questionnaires.filter(q => {
            return !q.isTemplate && q.userId !== null && q.userId !== clinicId;
        });

        if (invalidQuestionnaires.length > 0) {
            const invalidIds = invalidQuestionnaires.map(q => q.id).join(', ');
            throw new Error(`Questionnaires do not belong to your clinic: ${invalidIds}`);
        }

        const questionnaireMap = new Map<string, Questionnaire>();
        questionnaires.forEach(questionnaire => {
            questionnaireMap.set(questionnaire.id, questionnaire);
        });

        return questionnaireMap;
    }

    /**
     * Updates the product selection for a clinic
     * This method will validate products and questionnaires, then upsert the tenant products
     */
    async updateSelection(data: UpdateSelectionInput, userId: string) {
        // 1. Validate user permission and get clinic ID
        const { clinicId } = await this.validateUserPermission(userId);

        // 2. Extract unique product IDs and questionnaire IDs
        const productIds = [...new Set(data.products.map(p => p.productId))];
        const questionnaireIds = [...new Set(data.products.map(p => p.questionnaireId))];

        // 3. Validate products exist
        const productMap = await this.validateProducts(productIds);

        // 4. Validate questionnaires exist and belong to clinic
        const questionnaireMap = await this.validateQuestionnaires(questionnaireIds, clinicId);

        // 5. Check for duplicate product entries in the input
        const productIdCounts = new Map<string, number>();
        data.products.forEach(item => {
            const count = productIdCounts.get(item.productId) || 0;
            productIdCounts.set(item.productId, count + 1);
        });

        const duplicates = Array.from(productIdCounts.entries())
            .filter(([_, count]) => count > 1)
            .map(([productId, _]) => productId);

        if (duplicates.length > 0) {
            throw new Error(`Duplicate products in selection: ${duplicates.join(', ')}`);
        }

        // 6. Prepare data for bulk upsert
        const productsToUpsert = data.products.map(item => ({
            productId: item.productId,
            questionnaireId: item.questionnaireId,
        }));

        // 7. Bulk upsert tenant products
        const tenantProducts = await bulkUpsertTenantProducts(clinicId, productsToUpsert);

        // 8. Return the created/updated tenant products with full relations
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
