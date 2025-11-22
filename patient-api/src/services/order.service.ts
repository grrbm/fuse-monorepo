import { listOrdersByClinic, listOrdersByUser } from "./db/order";
import { getUser } from "./db/user";
import { OrderService as PharmacyOrderService } from "./pharmacy";
import Order from '../models/Order';
import User from '../models/User';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { OrderStatus } from '../models/Order';
import ShippingAddress from '../models/ShippingAddress';
import { StripeService } from '@fuse/stripe';
import Subscription, { PaymentStatus } from "../models/Subscription";
import TreatmentPlan from "../models/TreatmentPlan";
import Physician from "../models/Physician";
import PharmacyService from "./pharmacy.service";
import Treatment from "../models/Treatment";
import Payment from "../models/Payment";
import TenantProduct from "../models/TenantProduct";
import WebSocketService from "./websocket.service";
import PharmacyProduct from "../models/PharmacyProduct";
import Pharmacy from "../models/Pharmacy";


interface ListOrdersByClinicResult {
    success: boolean;
    message: string;
    data?: {
        orders: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    error?: string;
}

interface ListOrdersByUserResult {
    success: boolean;
    message: string;
    data?: {
        orders: Order[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    error?: string;
}

interface PaginationParams {
    page?: number;
    limit?: number;
}


class OrderService {

    // Prepare pharmacy order data from database
    private pharmacyOrderService = new PharmacyOrderService();
    private stripeService = new StripeService();

    constructor() {
        this.pharmacyOrderService = new PharmacyOrderService();
        this.stripeService = new StripeService();
    }


    async listOrdersByClinic(
        clinicId: string,
        userId: string,
        paginationParams: PaginationParams = {}
    ): Promise<ListOrdersByClinicResult> {
        try {
            // Get user and validate they are a doctor
            const user = await getUser(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            if (user.role !== 'doctor' && user.role !== 'brand') {
                return {
                    success: false,
                    message: "Access denied",
                    error: "Only doctors and brand users can list clinic orders"
                };
            }

            // Verify the user belongs to the clinic
            if (user.clinicId !== clinicId) {
                return {
                    success: false,
                    message: "Forbidden",
                    error: "User does not belong to the specified clinic"
                };
            }

            // Set default pagination values
            const page = Math.max(1, paginationParams.page || 1);
            const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));

            // Get orders by clinic with pagination
            const result = await listOrdersByClinic(clinicId, { page, limit });

            return {
                success: true,
                message: `Successfully retrieved ${result.orders.length} orders`,
                data: {
                    orders: result.orders,
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: result.totalPages
                    }
                }
            };

        } catch (error) {
            console.error('Error listing orders by clinic:', error);
            return {
                success: false,
                message: "Failed to retrieve orders",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async listOrdersByUser(
        userId: string,
        paginationParams: PaginationParams = {}
    ): Promise<ListOrdersByUserResult> {
        try {
            // Get user and validate they exist
            const user = await getUser(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            // Set default pagination values
            const page = Math.max(1, paginationParams.page || 1);
            const limit = Math.min(100, Math.max(1, paginationParams.limit || 10));

            // Get orders by user with pagination
            const result = await listOrdersByUser(userId, { page, limit });

            return {
                success: true,
                message: `Successfully retrieved ${result.orders.length} orders`,
                data: {
                    orders: result.orders,
                    pagination: {
                        page,
                        limit,
                        total: result.total,
                        totalPages: result.totalPages
                    }
                }
            };

        } catch (error) {
            console.error('Error listing orders by user:', error);
            return {
                success: false,
                message: "Failed to retrieve orders",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async approveOrder(orderId: string) {
        // TODO: this method might need to be expanded to create Order items depending on the information approved in the prescription
        try {
            // Get order with all related data including shipping address
            const order = await Order.findOne({
                where: { id: orderId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'firstName',
                            'lastName', 'email', 'pharmacyPatientId',
                            'clinicId', 'address', 'city', 'state', 'zipCode',
                            'phoneNumber', 'gender', 'dob'
                        ]
                    },
                    {
                        model: OrderItem,
                        as: 'orderItems',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'pharmacyProductId', 'placeholderSig']
                            }
                        ]
                    },
                    {
                        model: ShippingAddress,
                        as: 'shippingAddress',
                        attributes: ['id', 'address', 'apartment', 'city', 'state', 'zipCode', 'country']
                    },
                    {
                        model: TreatmentPlan,
                        as: 'treatmentPlan',
                        attributes: ['stripePriceId']
                    },
                    {
                        model: Treatment,
                        as: 'treatment',
                        attributes: ['pharmacyProvider']
                    },
                    {
                        model: Physician,
                        as: 'physician',
                        attributes: ['pharmacyPhysicianId']
                    },
                    {
                        model: Payment,
                        as: 'payment',
                        required: false,
                        attributes: ['id', 'stripePaymentIntentId', 'status', 'amount']
                    },
                    {
                        model: TenantProduct,
                        as: 'tenantProduct',
                        required: false,
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'pharmacyProvider', 'pharmacyProductId', 'placeholderSig', 'medicationSize']
                            }
                        ]
                    }

                ]
            });

            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                    error: "Order with the provided ID does not exist"
                };
            }



            // Mark order as approved by doctor (if not already set by auto-approval)
            if (!order.approvedByDoctor) {
                await order.update({ approvedByDoctor: true });
                console.log(`✅ Order marked as approved by doctor: ${order.orderNumber}`);
            }

            // Debug: Log order payment details
            console.log(`🔍 Order payment details:`, {
                orderNumber: order.orderNumber,
                status: order.status,
                paymentIntentId: order.payment?.stripePaymentIntentId,
                stripePriceId: order.stripePriceId,
                treatmentPlanStripePriceId: order.treatmentPlan?.stripePriceId,
                hasPayment: !!order.payment
            });

            // Check pharmacy coverage before proceeding
            const patientState = order.shippingAddress?.state || order.user?.state;
            const productId = order.tenantProduct?.product?.id;

            if (!patientState) {
                console.error(`❌ No patient state found for order: ${order.orderNumber}`);
                return {
                    success: false,
                    message: "Patient state not found",
                    error: "Cannot determine patient state for pharmacy order"
                };
            }

            if (!productId) {
                console.error(`❌ No product found for order: ${order.orderNumber}`);
                return {
                    success: false,
                    message: "Product not found",
                    error: "Cannot determine product for pharmacy order"
                };
            }

            // Find pharmacy coverage
            const coverage = await PharmacyProduct.findOne({
                where: {
                    productId,
                    state: patientState
                },
                include: [
                    {
                        model: Pharmacy,
                        as: 'pharmacy',
                        attributes: ['id', 'name', 'slug', 'isActive']
                    }
                ]
            });

            if (!coverage || !coverage.pharmacy?.isActive) {
                console.error(`❌ No active pharmacy coverage for product ${productId} in ${patientState}`);
                return {
                    success: false,
                    message: `No pharmacy coverage for this product in ${patientState}`,
                    error: "Pharmacy coverage not configured"
                };
            }

            console.log(`✅ Found pharmacy coverage: ${coverage.pharmacy.name} (${coverage.pharmacy.slug}) for ${patientState}`);

            // Handle payment capture and pharmacy order creation based on order status
            if (order.status === OrderStatus.PAID) {
                // Order is already paid, send to pharmacy
                console.log(`📦 [Approve] Order already paid, sending to pharmacy: ${order.orderNumber}`);
                console.log(`🏥 [Approve] Pharmacy details:`, {
                    pharmacy: coverage.pharmacy.name,
                    slug: coverage.pharmacy.slug,
                    state: patientState
                });
                try {
                    const pharmacyService = new PharmacyService()
                    console.log(`🚀 [Approve] Calling createPharmacyOrder...`);
                    const result = await pharmacyService.createPharmacyOrder(order, coverage.pharmacy.slug, coverage)
                    console.log(`✅ [Approve] Pharmacy order creation result:`, result);
                    if (result && result.success) {
                        console.log(`✅ [Approve] Pharmacy order created successfully for order ${orderId}`);
                    } else {
                        console.error(`⚠️ [Approve] Pharmacy order creation returned failure:`, result);
                    }
                } catch (pharmacyError) {
                    console.error(`❌ [Approve] Failed to create pharmacy order for ${orderId}:`, pharmacyError);
                    console.error(`❌ [Approve] Error stack:`, pharmacyError instanceof Error ? pharmacyError.stack : 'No stack trace');
                    // Don't fail the approval - order is already paid
                }
            } else if ((order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && order.payment?.stripePaymentIntentId) {
                // Get payment intent ID from Payment model (single source of truth)
                const paymentIntentId = order.payment.stripePaymentIntentId;

                if (!paymentIntentId) {
                    console.log(`⚠️ Order has no payment intent ID in Payment model: ${order.orderNumber}`);
                    return {
                        success: false,
                        message: "Order has no payment intent ID",
                        error: "Cannot capture payment without payment intent ID"
                    };
                }

                // Order has pending payment that needs to be captured
                console.log(`💳 [Approve] Capturing payment for order ${orderId} with payment intent ${paymentIntentId}`);

                try {
                    // Capture the payment
                    console.log(`🔄 [Approve] Calling Stripe capturePaymentIntent...`);
                    const capturedPayment = await this.stripeService.capturePaymentIntent(paymentIntentId);

                    console.log("✅ [Approve] capturedPayment ", capturedPayment)

                    // Get stripePriceId from either treatmentPlan or order directly (for product subscriptions)
                    const stripePriceId = order?.treatmentPlan?.stripePriceId || order?.stripePriceId

                    // Create subscription after successful payment capture
                    if (capturedPayment.payment_method && capturedPayment.customer && stripePriceId) {
                        try {
                            // Create subscription with the captured payment method
                            const subscription = await this.stripeService.createSubscriptionAfterPayment({
                                customerId: capturedPayment.customer as string,
                                priceId: stripePriceId,
                                paymentMethodId: capturedPayment.payment_method as string,
                                billingInterval: order.billingInterval, // Pass the billing interval from order
                                metadata: {
                                    userId: order.userId,
                                    orderId: order.id,
                                    ...(order?.treatmentId && {
                                        treatmentId: order?.treatmentId,
                                    }),
                                    initial_payment_intent_id: capturedPayment.id
                                }
                            });
                            await Subscription.create({
                                orderId: order.id,
                                stripeSubscriptionId: subscription.id,
                                status: PaymentStatus.PAID
                            })
                            console.log(`✅ Subscription created and attached to order: ${subscription.id}`);
                        } catch (error) {
                            console.error(`❌ Failed to create subscription after payment capture:`, error);
                            // Don't fail the approval process, but log the error
                        }
                    } else {
                        console.warn(`⚠️ Missing required data for subscription creation: payment_method=${!!capturedPayment.payment_method}, customer=${!!capturedPayment.customer}, stripePriceId=${!!stripePriceId}`);
                    }

                    console.log(`✅ [Approve] Payment captured successfully for order ${orderId}`);

                    // Update order status to paid
                    console.log(`📝 [Approve] Updating order status to PAID...`);
                    await order.updateStatus(OrderStatus.PAID);

                    // Reload order to get updated status after payment capture
                    await order.reload();
                    console.log(`✅ [Approve] Order status updated to: ${order.status}`);

                    // Send to pharmacy after payment is captured
                    console.log(`🏥 [Approve] Sending to pharmacy after payment capture...`);
                    console.log(`🏥 [Approve] Pharmacy details:`, {
                        pharmacy: coverage.pharmacy.name,
                        slug: coverage.pharmacy.slug,
                        state: patientState
                    });
                    try {
                        const pharmacyService = new PharmacyService()
                        console.log(`🚀 [Approve] Calling createPharmacyOrder after payment capture...`);
                        const result = await pharmacyService.createPharmacyOrder(order, coverage.pharmacy.slug, coverage)
                        console.log(`✅ [Approve] Pharmacy order creation result:`, result);
                        if (result && result.success) {
                            console.log(`✅ [Approve] Pharmacy order created successfully for order ${orderId}`);
                        } else {
                            console.error(`⚠️ [Approve] Pharmacy order creation returned failure:`, result);
                        }
                    } catch (pharmacyError) {
                        console.error(`❌ [Approve] Failed to create pharmacy order for ${orderId}:`, pharmacyError);
                        console.error(`❌ [Approve] Error stack:`, pharmacyError instanceof Error ? pharmacyError.stack : 'No stack trace');
                        // Don't fail the approval - order is paid and approved
                        // Pharmacy order can be retried manually if needed
                    }
                } catch (error: any) {
                    console.error(`❌ [Approve] Failed to capture payment for order ${orderId}:`, error);
                    console.error(`❌ [Approve] Payment capture error details:`, {
                        message: error?.message,
                        code: error?.code,
                        type: error?.type,
                        raw: error?.raw
                    });

                    // Check if payment was already captured (common during testing)
                    const isAlreadyCaptured = error?.raw?.message?.includes('has already been captured') ||
                        error?.message?.includes('has already been captured') ||
                        error?.code === 'charge_already_captured';

                    if (isAlreadyCaptured) {
                        console.log(`ℹ️ [Approve] Payment was already captured for order ${orderId}. Continuing with pharmacy order creation...`);

                        // Fetch the payment intent to get details for subscription
                        try {
                            const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
                            const stripePriceId = order?.treatmentPlan?.stripePriceId || order?.stripePriceId;

                            // Try to create subscription if not already exists
                            if (paymentIntent.payment_method && paymentIntent.customer && stripePriceId) {
                                const existingSubscription = await Subscription.findOne({ where: { orderId: order.id } });

                                if (!existingSubscription) {
                                    try {
                                        const subscription = await this.stripeService.createSubscriptionAfterPayment({
                                            customerId: paymentIntent.customer as string,
                                            priceId: stripePriceId,
                                            paymentMethodId: paymentIntent.payment_method as string,
                                            billingInterval: order.billingInterval,
                                            metadata: {
                                                userId: order.userId,
                                                orderId: order.id,
                                                ...(order?.treatmentId && {
                                                    treatmentId: order?.treatmentId,
                                                }),
                                                initial_payment_intent_id: paymentIntent.id
                                            }
                                        });
                                        await Subscription.create({
                                            orderId: order.id,
                                            stripeSubscriptionId: subscription.id,
                                            status: PaymentStatus.PAID
                                        });
                                        console.log(`✅ Subscription created for already-captured payment: ${subscription.id}`);
                                    } catch (subError) {
                                        console.error(`❌ Failed to create subscription:`, subError);
                                    }
                                }
                            }

                            // Update order to PAID
                            console.log(`📝 [Approve] Updating order status to PAID (already captured)...`);
                            await order.updateStatus(OrderStatus.PAID);
                            await order.reload();
                            console.log(`✅ [Approve] Order status updated to: ${order.status}`);

                            // Send to pharmacy
                            console.log(`🏥 [Approve] Sending to pharmacy (payment already captured)...`);
                            console.log(`🏥 [Approve] Pharmacy details:`, {
                                pharmacy: coverage.pharmacy.name,
                                slug: coverage.pharmacy.slug,
                                state: patientState
                            });
                            try {
                                const pharmacyService = new PharmacyService();
                                console.log(`🚀 [Approve] Calling createPharmacyOrder (payment already captured)...`);
                                const result = await pharmacyService.createPharmacyOrder(order, coverage.pharmacy.slug, coverage);
                                console.log(`✅ [Approve] Pharmacy order creation result:`, result);
                                if (result && result.success) {
                                    console.log(`✅ [Approve] Pharmacy order created successfully for order ${orderId}`);
                                } else {
                                    console.error(`⚠️ [Approve] Pharmacy order creation returned failure:`, result);
                                }
                            } catch (pharmacyError) {
                                console.error(`❌ [Approve] Failed to create pharmacy order for ${orderId}:`, pharmacyError);
                                console.error(`❌ [Approve] Error stack:`, pharmacyError instanceof Error ? pharmacyError.stack : 'No stack trace');
                                // Don't fail the approval - order is paid
                            }

                        } catch (retryError) {
                            console.error(`❌ [Approve] Failed to handle already-captured payment:`, retryError);
                            console.error(`❌ [Approve] Retry error stack:`, retryError instanceof Error ? retryError.stack : 'No stack trace');
                        }
                    } else {
                        // Different error - don't fail the approval but log it
                        console.log(`⚠️ [Approve] Order approved by doctor but payment capture failed. Will retry when payment is completed.`);
                        console.log(`⚠️ [Approve] Error type: ${error?.type}, Code: ${error?.code}`);
                    }
                }
            } else {
                // Order is not paid yet - doctor approval is recorded but pharmacy order not created
                console.log(`⚠️ [Approve] Order approved by doctor but not paid yet. Status: ${order.status}. Pharmacy order will be created when payment is completed.`);
                console.log(`ℹ️ [Approve] Order details:`, {
                    orderNumber: order.orderNumber,
                    status: order.status,
                    hasPayment: !!order.payment,
                    paymentIntentId: order.payment?.stripePaymentIntentId
                });
            }

            // Emit WebSocket event for order approval
            WebSocketService.emitOrderApproved({
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: order.userId,
                clinicId: order.clinicId,
                status: order.status,
                autoApproved: order.autoApprovedByDoctor || false,
            });

            return {
                success: true,
                message: "Order successfully approved and sent to pharmacy",
            };

        } catch (error) {
            console.error('Error approving order:', error);
            return {
                success: false,
                message: "Failed to approve order",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async addDoctorNotes(orderId: string, doctorId: string, noteText: string) {
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    { model: User, as: 'user', attributes: ['id'] }
                ]
            });

            if (!order) {
                return {
                    success: false,
                    message: "Order not found",
                    error: "Order with the provided ID does not exist"
                };
            }

            // Simply replace the note (single note, not array)
            await order.update({ doctorNotes: noteText });

            // Emit WebSocket event
            WebSocketService.emitDoctorNotesAdded({
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: order.userId,
                clinicId: order.clinicId,
                doctorNotes: noteText,
            });

            return {
                success: true,
                message: "Doctor notes saved successfully",
                data: { note: noteText }
            };

        } catch (error) {
            console.error('Error saving doctor notes:', error);
            return {
                success: false,
                message: "Failed to save doctor notes",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }


}



export default OrderService;
export type { ListOrdersByClinicResult, ListOrdersByUserResult, PaginationParams };