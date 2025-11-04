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
    // Calculate default price: 1% more than base product price
    let price = data.customPrice || 0;
    if (!data.customPrice) {
        const product = await Product.findByPk(data.productId);
        if (product && product.price) {
            price = product.price * 1.01; // 1% markup
        }
    }

    return TenantProduct.create({
        ...data,
        price
    });
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
                isActive: productData.active !== undefined ? productData.active : true,
                price: productData.customPrice ?? existing.price ?? 0,
            } as any);
            tenantProducts.push(existing);
        } else {
            // Calculate default price: 1% more than base product price
            let defaultPrice = 0;
            if (!productData.customPrice) {
                const product = await Product.findByPk(productData.productId);
                if (product && product.price) {
                    defaultPrice = product.price * 1.01; // 1% markup
                }
            }

            const created = await TenantProduct.create({
                clinicId,
                productId: productData.productId,
                questionnaireId: productData.questionnaireId,
                isActive: productData.active !== undefined ? productData.active : true,
                price: productData.customPrice ?? defaultPrice,
            } as any);
            tenantProducts.push(created);
        }
    }

    return tenantProducts;
}
