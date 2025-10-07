import Product from "../../models/Product";
import Questionnaire from "../../models/Questionnaire";
import TenantProduct from "../../models/TenantProduct";
import { normalizePagination, calculateTotalPages, type PaginationParams } from "../../utils/pagination";

export const getProduct = async (productId: string): Promise<Product | null> => {
    return Product.findByPk(productId);
}

export const getProductWithQuestionnaires = async (productId: string): Promise<Product | null> => {
    return Product.findByPk(productId, {
        include: [
            {
                model: Questionnaire,
                as: 'questionnaires',
                attributes: ['id', 'title']
            }
        ]
    });
}

export const listProducts = async (
    params: PaginationParams = {}
): Promise<{
    items: Product[],
    pagination: {
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
        pagination: {
            total,
            totalPages: calculateTotalPages(total, limit),
            page,
            limit
        }

    };
}

/**
 * Lists products associated with a clinic through TenantProduct junction table
 */
export const listProductsByClinic = async (
    clinicId: string,
): Promise<
    Product[]
> => {


    // Query TenantProduct to get products for this clinic
    const tenantProducts = await TenantProduct.findAll({
        where: { clinicId },
        include: [
            {
                model: Product,
                as: 'product',
            },
        ],

        order: [[{ model: Product, as: 'product' }, 'name', 'ASC']]
    });

    // Extract products from tenant products
    return tenantProducts.map(tp => tp.product);
}

