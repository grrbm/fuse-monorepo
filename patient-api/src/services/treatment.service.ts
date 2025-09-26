import Product from '../models/Product';
import User from '../models/User';
import TreatmentProducts from '../models/TreatmentProducts';
import { getTreatment } from './db/treatment';
import Treatment from '../models/Treatment';
import StripeService from './stripe';

interface TreatmentProductData {
    productId: string;
    dosage: string;
}

interface TreatmentProductAssociationResult {
    success: boolean;
    message: string;
    error?: string;
}

interface UpdateTreatmentData {
    name?: string;
    price?: number;
    products?: TreatmentProductData[];
}

interface UpdateTreatmentResult {
    success: boolean;
    message: string;
    data?: {
        id: string;
        name: string;
        treatmentLogo: string;
    };
    error?: string;
}

const MARKUP = 10;

class TreatmentService {
    private stripeService: StripeService;

    constructor() {
        this.stripeService = new StripeService();
    }
    async associateProductsWithTreatment(
        treatmentId: string,
        products: TreatmentProductData[],
        userId: string
    ): Promise<TreatmentProductAssociationResult> {
        try {
            // Get user and validate they are a doctor
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            if (user.role !== 'doctor') {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Only doctors can associate products with treatments"
                };
            }

            const treatment = await getTreatment(treatmentId);

            if (!treatment) {
                return {
                    success: false,
                    message: "Treatment not found",
                    error: "Treatment with the provided ID does not exist"
                };
            }

            // Verify treatment belongs to user's clinic
            if (treatment.clinicId !== user.clinicId) {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Treatment does not belong to your clinic"
                };
            }

            // Validate products is an array
            if (!Array.isArray(products)) {
                return {
                    success: false,
                    message: "Invalid input",
                    error: "products must be an array"
                };
            }

            // Validate each product object has required fields
            for (const product of products) {
                if (!product.productId || !product.dosage) {
                    return {
                        success: false,
                        message: "Invalid product data",
                        error: "Each product must have productId and dosage"
                    };
                }
            }

            // Validate that all products exist
            if (products.length > 0) {
                const productIds = products.map(p => p.productId);
                const existingProducts = await Product.findAll({
                    where: { id: productIds }
                });

                if (existingProducts.length !== productIds.length) {
                    const foundIds = existingProducts.map(p => p.id);
                    const missingIds = productIds.filter(id => !foundIds.includes(id));

                    return {
                        success: false,
                        message: "Some products not found",
                        error: `Products with IDs ${missingIds.join(', ')} do not exist`
                    };
                }
            }

            // Remove all existing TreatmentProducts associations for this treatment
            await TreatmentProducts.destroy({
                where: { treatmentId: treatmentId },
                force: true,
            });

            // Add new associations with dosage
            if (products.length > 0) {
                // Create TreatmentProducts records with dosage individually to ensure proper associations
                for (const product of products) {
                    await TreatmentProducts.upsert({
                        treatmentId: treatmentId,
                        productId: product.productId,
                        dosage: product.dosage
                    });
                }

                console.log(`✅ Created ${products.length} TreatmentProducts for treatment ${treatmentId}`);

                // Calculate products price with markup
                const productIds = products.map(p => p.productId);
                const existingProducts = await Product.findAll({
                    where: { id: productIds }
                });

                const totalProductsPrice = existingProducts.reduce((sum, product) => sum + product.price, 0);
                const markupAmount = (totalProductsPrice * MARKUP) / 100;
                const finalProductsPrice = totalProductsPrice + markupAmount;

                // Update treatment's productsPrice
                await treatment.update({
                    productsPrice: finalProductsPrice
                });
            } else {
                // If no products, set productsPrice to 0
                await treatment.update({
                    productsPrice: 0
                });
            }

            return {
                success: true,
                message: `Successfully associated ${products.length} products with treatment`,
            };

        } catch (error) {
            console.error('Error associating products with treatment:', error);
            console.error('Error associating products with treatment:', JSON.stringify(error));

            return {
                success: false,
                message: "Failed to associate products with treatment",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async updateTreatment(
        treatmentId: string,
        updateData: UpdateTreatmentData,
        userId: string
    ): Promise<UpdateTreatmentResult> {
        try {
            // Get user and validate they are a doctor
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            if (user.role !== 'doctor') {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Only doctors can update treatments"
                };
            }

            // Get treatment and validate ownership
            const treatment = await getTreatment(treatmentId);
            if (!treatment) {
                return {
                    success: false,
                    message: "Treatment not found",
                    error: "Treatment with the provided ID does not exist"
                };
            }

            // Verify treatment belongs to user's clinic
            if (treatment.clinicId !== user.clinicId) {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Treatment does not belong to your clinic"
                };
            }

            // Update treatment fields
            const updateFields: any = {};
            if (updateData.name !== undefined) {
                updateFields.name = updateData.name.trim();
            }
            if (updateData.price !== undefined) {
                updateFields.price = updateData.price;
            }

            if (Object.keys(updateFields).length > 0) {
                await treatment.update(updateFields);
            }


            // Update products if provided
            if (updateData.products !== undefined) {
                const associationResult = await this.associateProductsWithTreatment(
                    treatmentId,
                    updateData.products,
                    userId
                );

                if (!associationResult.success) {
                    return {
                        success: false,
                        message: "Failed to update treatment products",
                        error: associationResult.error
                    };
                }
            }

            // Reload treatment to get updated data
            await treatment.reload();

            return {
                success: true,
                message: "Treatment updated successfully",
                data: {
                    id: treatment.id,
                    name: treatment.name,
                    treatmentLogo: treatment.treatmentLogo,
                }
            };

        } catch (error) {
            console.error('Error updating treatment:', error);
            return {
                success: false,
                message: "Failed to update treatment",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }


}

export default TreatmentService;
export { TreatmentProductAssociationResult, TreatmentProductData, UpdateTreatmentData, UpdateTreatmentResult };