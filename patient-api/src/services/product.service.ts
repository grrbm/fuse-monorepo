import { listProducts, getProductWithQuestionnaires } from "./db/product";
import { getUser } from "./db/user";
import Product from '../models/Product';
import type { PaginationInput } from '@fuse/validators';


interface ListProductsResult {
    success: boolean;
    message: string;
    data?: {
        items: Product[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    error?: string;
}

interface GetProductResult {
    success: boolean;
    message: string;
    data?: Product;
    error?: string;
}

class ProductService {
    /**
     * Lists all products with pagination
     * Can be called by admin or brand users
     */
    async listProducts(
        userId: string,
        paginationParams: Partial<PaginationInput> = {}
    ): Promise<ListProductsResult> {
        try {
            // Get user and validate they have permission
            const user = await getUser(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            // Check user role - only admin and brand users can list products
            if (user.role !== 'admin' && user.role !== 'brand') {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Only admin and brand users can list products"
                };
            }


            // Get products with pagination
            const result = await listProducts(paginationParams);

            return {
                success: true,
                message: `Successfully retrieved ${result.items.length} products`,
                data: result
            };

        } catch (error) {
            console.error('❌ Error listing products:', error);
            return {
                success: false,
                message: "Failed to list products",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }

    /**
     * Gets a single product with associated questionnaires
     * Can be called by admin or brand users
     */
    async getProduct(productId: string, userId: string): Promise<GetProductResult> {
        try {
            // Get user and validate they have permission
            const user = await getUser(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            // Check user role - only admin and brand users can get product details
            if (user.role !== 'admin' && user.role !== 'brand') {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Only admin and brand users can view product details"
                };
            }

            // Get product with questionnaires
            const product = await getProductWithQuestionnaires(productId);

            if (!product) {
                return {
                    success: false,
                    message: "Product not found",
                    error: "Product with the provided ID does not exist"
                };
            }

            return {
                success: true,
                message: "Product retrieved successfully",
                data: product
            };

        } catch (error) {
            console.error('❌ Error getting product:', error);
            return {
                success: false,
                message: "Failed to get product",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }
}

export default ProductService;
