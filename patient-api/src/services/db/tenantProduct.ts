import TenantProduct from "../../models/TenantProduct";
import Product from "../../models/Product";
import Questionnaire from "../../models/Questionnaire";

export const getTenantProduct = async (id: string): Promise<TenantProduct | null> => {
    return TenantProduct.findByPk(id, {
        include: [
            { model: Product },
            { model: Questionnaire }
        ]
    });
}

export const getTenantProductsByClinic = async (clinicId: string): Promise<TenantProduct[]> => {
    return TenantProduct.findAll({
        where: { clinicId },
        include: [
            { model: Product },
            { model: Questionnaire }
        ]
    });
}

export const getTenantProductByClinicAndProduct = async (
    clinicId: string,
    productId: string
): Promise<TenantProduct | null> => {
    return TenantProduct.findOne({
        where: { clinicId, productId },
        include: [
            { model: Product },
            { model: Questionnaire }
        ]
    });
}

export const createTenantProduct = async (data: {
    clinicId: string;
    productId: string;
    questionnaireId: string;
    active?: boolean;
    customPrice?: number;
}): Promise<TenantProduct> => {
    return TenantProduct.create(data);
}

export const updateTenantProduct = async (
    id: string,
    data: Partial<{
        questionnaireId: string;
        active: boolean;
        customPrice: number;
    }>
): Promise<[number]> => {
    return TenantProduct.update(data, { where: { id } });
}

export const deleteTenantProduct = async (id: string): Promise<number> => {
    // Hard delete
    return TenantProduct.destroy({ where: { id }, force: true } as any);
}

export const deleteTenantProductsByClinic = async (clinicId: string): Promise<number> => {
    return TenantProduct.destroy({ where: { clinicId } });
}

export const bulkUpsertTenantProducts = async (
    clinicId: string,
    products: Array<{
        productId: string;
        questionnaireId: string;
        active?: boolean;
        customPrice?: number;
    }>
): Promise<TenantProduct[]> => {
    const tenantProducts: TenantProduct[] = [];

    for (const productData of products) {
        // Look up existing by clinicId + productId
        const existing = await TenantProduct.findOne({
            where: { clinicId, productId: productData.productId },
        });

        if (existing) {
            await existing.update({
                questionnaireId: productData.questionnaireId,
                active: productData.active !== undefined ? productData.active : true,
                price: productData.customPrice ?? existing.price ?? 0,
            } as any);
            tenantProducts.push(existing);
        } else {
            const created = await TenantProduct.create({
                clinicId,
                productId: productData.productId,
                questionnaireId: productData.questionnaireId,
                active: productData.active !== undefined ? productData.active : true,
                price: productData.customPrice ?? 0,
            } as any);
            tenantProducts.push(created);
        }
    }

    return tenantProducts;
}
