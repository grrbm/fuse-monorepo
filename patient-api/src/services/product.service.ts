import Product from '../models/Product'
import FormSectionTemplate from '../models/FormSectionTemplate'
import { Op } from 'sequelize'
import { getProductWithQuestionnaires, listProductsByClinic } from './db/product'
import { getUser } from './db/user'

/**
 * Helper function to serialize product data, converting DECIMAL fields from strings to numbers
 */
function serializeProduct(product: Product): Product {
    const plain = product.toJSON()
    return {
        ...plain,
        pharmacyWholesaleCost: plain.pharmacyWholesaleCost ? parseFloat(plain.pharmacyWholesaleCost as any) : undefined,
        suggestedRetailPrice: plain.suggestedRetailPrice ? parseFloat(plain.suggestedRetailPrice as any) : undefined,
        price: plain.price ? parseFloat(plain.price as any) : plain.price,
    }
}

interface CreateProductInput {
    name: string
    description: string
    price: number
    activeIngredients: string[]
    dosage: string
    imageUrl?: string
    pharmacyVendor?: string
    pharmacyWholesaleCost?: number
    pharmacyProductId?: string
    medicationSize?: string
    category?: string
    requiredDoctorQuestions?: any[]
    pharmacyApiConfig?: Record<string, any>
    suggestedRetailPrice?: number
    isActive?: boolean
}

interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string
}

class ProductService {
    async listProducts(userId: string, options: { page?: number; limit?: number; category?: string; isActive?: boolean } = {}) {
        const { page = 1, limit = 50, category, isActive } = options
        const offset = (page - 1) * limit

        const where: any = {}

        if (category) {
            where.category = category
        }

        if (typeof isActive === 'boolean') {
            where.isActive = isActive
        }

        const { rows: products, count: total } = await Product.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true,
        })

        return {
            success: true,
            message: `Retrieved ${products.length} products`,
            data: {
                products: products.map(serializeProduct),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        }
    }

    async getProduct(productId: string, userId: string) {
        const product = await getProductWithQuestionnaires(productId)

        if (!product) {
            return {
                success: false,
                message: 'Product not found',
            }
        }

        return {
            success: true,
            data: serializeProduct(product),
        }
    }

    async createProduct(input: CreateProductInput, userId: string) {
        try {
            // Validate required fields
            if (!input.name || !input.description || input.price === undefined || !input.activeIngredients || !input.dosage) {
                return {
                    success: false,
                    message: 'Missing required fields',
                    missingFields: [],
                }
            }

            // Create the product
            const product = await Product.create({
                ...input,
                isActive: input.isActive ?? true,
            } as any)

            // If there are requiredDoctorQuestions, create a FormSectionTemplate
            if (input.requiredDoctorQuestions && input.requiredDoctorQuestions.length > 0) {
                await FormSectionTemplate.create({
                    name: `${input.name} - Doctor Questions`,
                    description: `Mandatory medical questions for ${input.name}`,
                    sectionType: 'doctor',
                    category: input.category,
                    treatmentId: null, // Will be linked when product is associated with treatment
                    schema: {
                        questions: input.requiredDoctorQuestions,
                    },
                    version: 1,
                    isActive: true,
                } as any)
            }

            return {
                success: true,
                message: 'Product created successfully',
                data: serializeProduct(product),
            }
        } catch (error: any) {
            console.error('❌ Error creating product:', error)
            return {
                success: false,
                message: error.message || 'Failed to create product',
            }
        }
    }

    async updateProduct(input: UpdateProductInput, userId: string) {
        try {
            const product = await Product.findByPk(input.id)

            if (!product) {
                return {
                    success: false,
                    message: 'Product not found',
                }
            }

            // Update the product
            await product.update(input as any)

            // If requiredDoctorQuestions were updated, update or create FormSectionTemplate
            if (input.requiredDoctorQuestions) {
                const existingTemplate = await FormSectionTemplate.findOne({
                    where: {
                        sectionType: 'doctor',
                        category: product.category || input.category,
                    },
                    order: [['version', 'DESC']],
                })

                if (existingTemplate) {
                    // Create a new version
                    await FormSectionTemplate.create({
                        name: existingTemplate.name,
                        description: existingTemplate.description,
                        sectionType: 'doctor',
                        category: product.category || input.category,
                        treatmentId: null,
                        schema: {
                            questions: input.requiredDoctorQuestions,
                        },
                        version: existingTemplate.version + 1,
                        isActive: true,
                    } as any)
                } else {
                    // Create first version
                    await FormSectionTemplate.create({
                        name: `${product.name} - Doctor Questions`,
                        description: `Mandatory medical questions for ${product.name}`,
                        sectionType: 'doctor',
                        category: product.category || input.category,
                        treatmentId: null,
                        schema: {
                            questions: input.requiredDoctorQuestions,
                        },
                        version: 1,
                        isActive: true,
                    } as any)
                }
            }

            return {
                success: true,
                message: 'Product updated successfully',
                data: serializeProduct(product),
            }
        } catch (error: any) {
            console.error('❌ Error updating product:', error)
            return {
                success: false,
                message: error.message || 'Failed to update product',
            }
        }
    }

    async deleteProduct(productId: string, userId: string) {
        try {
            const product = await Product.findByPk(productId)

            if (!product) {
                return {
                    success: false,
                    message: 'Product not found',
                }
            }

            // Soft delete by setting isActive to false
            await product.update({ isActive: false })

            return {
                success: true,
                message: 'Product deactivated successfully',
            }
        } catch (error: any) {
            console.error('❌ Error deleting product:', error)
            return {
                success: false,
                message: error.message || 'Failed to delete product',
            }
        }
    }

    async listCategories(userId: string) {
        const categories = await Product.findAll({
            attributes: [[Product.sequelize!.fn('DISTINCT', Product.sequelize!.col('category')), 'category']],
            where: {
                category: {
                    [Op.ne]: null,
                },
            },
            raw: true,
        })

        return {
            success: true,
            data: categories.map((c: any) => c.category).filter(Boolean),
        }
    }

    async listPharmacyVendors(userId: string) {
        // Return available pharmacy vendors from config
        const vendors = [
            {
                id: 'absoluterx',
                name: 'AbsoluteRx',
                baseUrl: 'https://portal.absoluterx.com',
                description: 'Primary fulfillment partner for compounded medications',
            },
            {
                id: 'pharmacy_a',
                name: 'Pharmacy A',
                baseUrl: 'https://api.pharmacya.com',
                description: 'Alternative pharmacy vendor',
            },
            {
                id: 'pharmacy_b',
                name: 'Pharmacy B',
                baseUrl: 'https://api.pharmacyb.com',
                description: 'Specialty pharmacy for specific medications',
            },
        ]

        return {
            success: true,
            data: vendors,
        }
    }
    /**
      * Gets products by clinic ID
      */
    async getProductsByClinic(clinicId: string, userId: string) {
        try {
            // Get user and validate permissions
            const user = await getUser(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            // Only allow doctors and brand users
            if (user.role !== 'doctor' && user.role !== 'brand') {
                return {
                    success: false,
                    message: "Access denied",
                    error: `Only doctors and brand users can access products. Your role: ${user.role}`
                };
            }

            // Verify user has access to this clinic
            if (user.clinicId !== clinicId) {
                return {
                    success: false,
                    message: "Access denied",
                    error: "You can only access products for your own clinic"
                };
            }

            console.log(`🛍️ Fetching products for clinic: ${clinicId}, user role: ${user.role}, user clinicId: ${user.clinicId}`);

            const result = await listProductsByClinic(
                clinicId,
            )

            return {
                success: true,
                message: `Successfully retrieved ${result.length} products`,
                items: result
            };



        } catch (error) {
            console.error('❌ Error fetching products by clinic:', error);
            return {
                success: false,
                message: "Failed to fetch products",
                error: error instanceof Error ? error.message : "Unknown error"
            };
        }
    }
}

export default ProductService

