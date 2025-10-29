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
                            'clinicId', 'address', 'city', 'state', 'zipCode'
                        ]
                    },
                    {
                        model: OrderItem,
                        as: 'orderItems',
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'pharmacyProductId', 'dosage']
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
                                attributes: ['id', 'name', 'pharmacyProvider', 'pharmacyProductId']
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

            // Handle payment capture and pharmacy order creation based on order status
            if (order.status === OrderStatus.PAID) {
                // Order is already paid, send to pharmacy
                console.log(`📦 Order already paid, sending to pharmacy: ${order.orderNumber}`);
                const pharmacyService = new PharmacyService()
                await pharmacyService.createPharmacyOrder(order)
            } else if (order.status === OrderStatus.PENDING && order.payment?.stripePaymentIntentId) {
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
                console.log(`💳 Capturing payment for order ${orderId} with payment intent ${paymentIntentId}`);

                try {
                    // Capture the payment
                    const capturedPayment = await this.stripeService.capturePaymentIntent(paymentIntentId);

                    console.log(" capturedPayment ", capturedPayment)

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

                    console.log(`✅ Payment captured successfully for order ${orderId}`);

                    // Update order status to paid
                    await order.updateStatus(OrderStatus.PAID);

                    // Reload order to get updated status after payment capture
                    await order.reload();

                    // Send to pharmacy after payment is captured
                    const pharmacyService = new PharmacyService()
                    await pharmacyService.createPharmacyOrder(order)
                } catch (error: any) {
                    console.error(`❌ Failed to capture payment for order ${orderId}:`, error);

                    // Check if payment was already captured (common during testing)
                    const isAlreadyCaptured = error?.raw?.message?.includes('has already been captured') ||
                        error?.message?.includes('has already been captured') ||
                        error?.code === 'charge_already_captured';

                    if (isAlreadyCaptured) {
                        console.log(`ℹ️ Payment was already captured for order ${orderId}. Continuing with pharmacy order creation...`);

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
                            await order.updateStatus(OrderStatus.PAID);
                            await order.reload();

                            // Send to pharmacy
                            const pharmacyService = new PharmacyService();
                            await pharmacyService.createPharmacyOrder(order);

                        } catch (retryError) {
                            console.error(`❌ Failed to handle already-captured payment:`, retryError);
                        }
                    } else {
                        // Different error - don't fail the approval but log it
                        console.log(`⚠️ Order approved by doctor but payment capture failed. Will retry when payment is completed.`);
                    }
                }
            } else {
                // Order is not paid yet - doctor approval is recorded but pharmacy order not created
                console.log(`⚠️ Order approved by doctor but not paid yet. Status: ${order.status}. Pharmacy order will be created when payment is completed.`);
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