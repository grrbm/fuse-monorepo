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



            // Check if order can be approved (pending orders with payment intent can be captured)
            if (order.status === OrderStatus.PAID) {
                // Order is already paid, proceed with approval
            } else if (order.status === OrderStatus.PENDING && order.paymentIntentId) {
                // Order has pending payment that needs to be captured
                console.log(`💳 Capturing payment for order ${orderId} with payment intent ${order.paymentIntentId}`);


                // Capture the payment
                const capturedPayment = await this.stripeService.capturePaymentIntent(order.paymentIntentId);

                console.log(" capturedPayment ", capturedPayment)

                const stripePriceId = order?.treatmentPlan?.stripePriceId

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
                                ...(order?.treatmentId &&{
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
            } else {
                return {
                    success: false,
                    message: "Order cannot be approved",
                    error: `Order status is ${order.status}. Only paid orders or pending orders with payment intent can be approved.`
                };
            }


            // First time creating order 
            const pharmacyService = new PharmacyService()
            await pharmacyService.createPharmacyOrder(order)

            // Emit WebSocket event for order approval
            WebSocketService.emitOrderApproved({
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: order.userId,
                clinicId: order.clinicId,
                status: order.status,
                autoApproved: order.autoApproved || false,
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

            // Get existing notes or initialize empty array
            const existingNotes = order.doctorNotes || [];

            // Add new note with timestamp
            const newNote = {
                doctorId,
                note: noteText,
                timestamp: new Date().toISOString(),
            };

            const updatedNotes = [...existingNotes, newNote];

            // Update order with new notes
            await order.update({ doctorNotes: updatedNotes });

            // Emit WebSocket event
            WebSocketService.emitDoctorNotesAdded({
                orderId: order.id,
                orderNumber: order.orderNumber,
                userId: order.userId,
                clinicId: order.clinicId,
                doctorNotes: updatedNotes,
            });

            return {
                success: true,
                message: "Doctor notes added successfully",
                data: { notes: updatedNotes }
            };

        } catch (error) {
            console.error('Error adding doctor notes:', error);
            return {
                success: false,
                message: "Failed to add doctor notes",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }


}



export default OrderService;
export type { ListOrdersByClinicResult, ListOrdersByUserResult, PaginationParams };