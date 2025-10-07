import Product from "../../models/Product";
import TenantProduct from "../../models/TenantProduct";
import Questionnaire from "../../models/Questionnaire";
import { normalizePagination, calculateTotalPages, type PaginationParams } from "../../utils/pagination";

export const getProduct = async (productId: string): Promise<Product | null> => {
    return Product.findByPk(productId);
}

export const getProductWithQuestionnaires = async (productId: string): Promise<Product | null> => {
    return Product.findByPk(productId, {
        include: [
            {
                model: TenantProduct,
                as: 'tenantProducts',
                include: [
                    {
                        model: Questionnaire,
                        as: 'questionnaire',
                        attributes: ['id', 'title']
                    }
                ]
            }
        ]
    });
}

export const listProducts = async (
    params: PaginationParams = {}
): Promise<{
    items: Product[],
    pagination:{
        page: number,
        limit: number,
        total: number,
        totalPages: number
    }

}> => {

    const { page, limit, offset } = normalizePagination(params);

    const { rows: items, count: total } = await Product.findAndCountAll({
        order: [['name', 'ASC']],
        limit,
        offset,
        distinct: true
    });

    return {
        items,
        pagination:{
            total,
            totalPages: calculateTotalPages(total, limit),
            page,
            limit
        }
       
    };
}

export const listProductsByClinic = async (
    clinicId: string,
    params: PaginationParams = {}
): Promise<{ products: Product[], total: number, totalPages: number }> => {
    const { limit, offset } = normalizePagination(params);

    // Products are not directly associated with clinics in the current schema
    // This will be filtered through TenantProduct junction table
    const { rows: products, count: total } = await Product.findAndCountAll({
        order: [['name', 'ASC']],
        limit,
        offset,
        distinct: true
    });

    return {
        products,
        total,
        totalPages: calculateTotalPages(total, limit)
    };
}
