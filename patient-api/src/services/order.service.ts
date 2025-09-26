import { listOrdersByClinic, listOrdersByUser } from "./db/order";
import { getUser } from "./db/user";
import { OrderService as PharmacyOrderService } from "./pharmacy";
import Order from '../models/Order';
import User from '../models/User';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { OrderStatus } from '../models/Order';
import ShippingOrder, { OrderShippingStatus } from '../models/ShippingOrder';
import ShippingAddress from '../models/ShippingAddress';
import UserService from "./user.service";
import StripeService from "./stripe";
import Subscription, { PaymentStatus } from "../models/Subscription";
import TreatmentPlan from "../models/TreatmentPlan";
import Physician from "../models/Physician";


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

    async approveOrder(orderId: string, physicianId: string) {
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

            await order.update({ physicianId: physicianId });
            await order.reload();


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
                                treatmentId: order.treatmentId,
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


            // Create pharmacy order using the new method
            const pharmacyOrderResult = await this.createPharmacyOrder(order);

            if (!pharmacyOrderResult.success) {
                return pharmacyOrderResult;
            }

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

    async createPharmacyOrder(order: Order) {
        // Sync address before creating order
        const userService = new UserService();
        const user = await userService.syncPatientFromUser(order.user.id, order.shippingAddressId);

        const pharmacyPatientId = user?.pharmacyPatientId

        if (!pharmacyPatientId) {
            return {
                success: false,
                message: "No patient associated with user",
                error: "No patient associated with user"
            };
        }

        // Map order items to pharmacy products
        const products = order.orderItems.map(item => ({
            sku: parseInt(item.pharmacyProductId), // Use pharmacy product ID or default
            quantity: item.quantity,
            refills: 2, // Default refills - could be made configurable
            days_supply: 30, // Default days supply - could be made configurable
            sig: item.dosage || item.product.dosage || "Use as directed",
            medical_necessity: item.notes || "Prescribed treatment as part of patient care plan."
        }));


        const pharmacyPhysicianId = order?.physician?.pharmacyPhysicianId


        if (!pharmacyPhysicianId) {
            return {
                success: false,
                message: "No physician associated with order",
                error: "No physician associated with order",
            };
        }
        // Create pharmacy order
        const pharmacyResult = await this.pharmacyOrderService.createOrder({
            patient_id: parseInt(pharmacyPatientId),
            physician_id: parseInt(pharmacyPhysicianId),
            ship_to_clinic: 0, // Ship to patient
            service_type: "two_day",
            signature_required: 1,
            memo: order.notes || "Order approved",
            external_id: order.id,
            test_order: process.env.NODE_ENV === 'production' ? 0 : 1,
            products: products
        });

        if (!pharmacyResult.success) {
            return {
                success: false,
                message: "Failed to create pharmacy order",
                error: pharmacyResult.error || "Unknown pharmacy error"
            };
        }

        const pharmacyOrderId = pharmacyResult.data?.id?.toString();

        // Create shipping order with proper address reference
        await ShippingOrder.create({
            orderId: order.id,
            shippingAddressId: order.shippingAddressId,
            status: OrderShippingStatus.PROCESSING,
            pharmacyOrderId: pharmacyOrderId
        });

        return {
            success: true,
            message: "Pharmacy order created successfully",
            data: {
                pharmacyOrderId: pharmacyOrderId
            }
        };
    }
}



export default OrderService;
export { ListOrdersByClinicResult, ListOrdersByUserResult, PaginationParams };