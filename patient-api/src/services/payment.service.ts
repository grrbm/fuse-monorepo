import User from '../models/User';
import Treatment from '../models/Treatment';
import Clinic from '../models/Clinic';
import Order, { OrderStatus } from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import TreatmentProducts from '../models/TreatmentProducts';
import ShippingAddress from '../models/ShippingAddress';
import StripeService from './stripe';
import TreatmentPlan, { BillingInterval } from '../models/TreatmentPlan';
import Payment from '../models/Payment';

interface SubscribeTreatmentResult {
    success: boolean;
    message: string;
    data?: {
        clientSecret: string;
        subscriptionId?: string;
        orderId: string;
        paymentIntentId: string;
    };
    error?: string;
}

interface SubscribeClinicResult {
    success: boolean;
    message: string;
    data?: {
        paymentUrl: string;
    };
    error?: string;
}

class PaymentService {
    private stripeService: StripeService;

    constructor() {
        this.stripeService = new StripeService();
    }

    async subscribeTreatment(
        {
            treatmentId,
            treatmentPlanId,
            userId,
            shippingInfo,
            billingInterval = BillingInterval.MONTHLY,
            stripePriceId,
            questionnaireAnswers,
        }: {
            treatmentId: string,
            treatmentPlanId: string,
            userId: string,
            shippingInfo: {
                address: string;
                apartment?: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
            },
            billingInterval: BillingInterval,
            stripePriceId: string,
            questionnaireAnswers?: Record<string, string>,
        }
    ): Promise<SubscribeTreatmentResult> {
        try {
            // Get user and validate
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            // Get treatment with products and validate
            const treatment = await Treatment.findByPk(treatmentId, {
                include: [
                    {
                        model: TreatmentProducts,
                        as: 'treatmentProducts',
                        include: [
                            {
                                model: Product,
                                as: 'product'
                            }
                        ]
                    }
                ]
            });
            if (!treatment) {
                return {
                    success: false,
                    message: "Treatment not found",
                    error: "Treatment with the provided ID does not exist"
                };
            }

            // Get treatment plan and validate
            const treatmentPlan = await TreatmentPlan.findByPk(treatmentPlanId);
            if (!treatmentPlan) {
                return {
                    success: false,
                    message: "Treatment plan not found",
                    error: "Treatment plan with the provided ID does not exist"
                };
            }

            // Validate treatment has Stripe data
            if (!treatment.stripeProductId) {
                return {
                    success: false,
                    message: "Treatment not configured for subscriptions",
                    error: "Treatment does not have Stripe product or price configured"
                };
            }

            // Ensure user has a Stripe customer ID
            let stripeCustomerId = user.stripeCustomerId;
            if (!stripeCustomerId) {
                const stripeCustomer = await this.stripeService.createCustomer(
                    user.email,
                    `${user.firstName} ${user.lastName}`
                );
                stripeCustomerId = stripeCustomer.id;

                // Save Stripe customer ID to user
                await user.update({ stripeCustomerId });
            }


            // Calculate order amount from treatment plan
            const totalAmount = treatmentPlan.price;


            const shippingAddress = await ShippingAddress.create({
                address: shippingInfo.address,
                apartment: shippingInfo.apartment,
                city: shippingInfo.city,
                state: shippingInfo.state,
                zipCode: shippingInfo.zipCode,
                country: shippingInfo.country,
                userId
            });
            // Create order
            const order = await Order.create({
                orderNumber: Order.generateOrderNumber(),
                userId: userId,
                treatmentId: treatmentId,
                treatmentPlanId: treatmentPlanId,
                status: OrderStatus.PENDING,
                billingInterval: billingInterval,
                subtotalAmount: totalAmount,
                totalAmount: totalAmount,
                questionnaireAnswers: questionnaireAnswers,
                shippingAddressId: shippingAddress.id
            });

            // Create order items from treatment products
            if (treatment.treatmentProducts && treatment.treatmentProducts.length > 0) {
                const orderItems = [];
                for (const treatmentProduct of treatment.treatmentProducts) {
                    const product = treatmentProduct.product;
                    const orderItem = await OrderItem.create({
                        orderId: order.id,
                        productId: product.id,
                        quantity: 1, // Default quantity for subscription
                        unitPrice: product.price || 0,
                        totalPrice: product.price || 0,
                        pharmacyProductId: product.pharmacyProductId,
                        dosage: treatmentProduct.dosage || product.dosage || "Use as directed"
                    });
                    orderItems.push(orderItem);
                }
                console.log(`✅ Created ${orderItems.length} order items for treatment subscription`);
            }

            // Create Stripe payment intent for manual capture (subscription created after approval)
            // Default expiration: 48 hours (2880 minutes) for manual capture orders
            const paymentIntent = await this.stripeService.createPaymentIntent(
                totalAmount,
                'usd',
                stripeCustomerId,
                {
                    userId: userId,
                    orderId: order.id,
                    treatmentId: treatmentId,
                    stripePriceId: stripePriceId,
                    order_type: 'subscription_initial_payment'
                }
            );

            console.log('📋 Payment intent created:', JSON.stringify(paymentIntent, null, 2));

            if (!paymentIntent || !paymentIntent.client_secret) {
                console.error('❌ No payment intent or client secret found');
                throw new Error('Failed to create payment intent');
            }

            // Update order with payment intent ID and stripePriceId for later subscription creation
            await order.update({
                paymentIntentId: paymentIntent.id,
                stripePriceId: stripePriceId
            });

            // Create payment record
            await Payment.create({
                orderId: order.id,
                stripePaymentIntentId: paymentIntent.id,
                status: 'pending',
                paymentMethod: 'card',
                amount: totalAmount,
                currency: 'usd'
            });

            return {
                success: true,
                message: "Payment intent created successfully (manual capture enabled - subscription will be created after approval)",
                data: {
                    clientSecret: paymentIntent.client_secret,
                    orderId: order.id,
                    paymentIntentId: paymentIntent.id
                }
            };

        } catch (error) {
            console.error('Error creating subscription:', error);
            return {
                success: false,
                message: "Failed to create subscription",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async subscribeClinic(
        clinicId: string,
        userId: string
    ): Promise<SubscribeClinicResult> {
        try {
            // Get user and validate
            const user = await User.findByPk(userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "User with the provided ID does not exist"
                };
            }

            // Get clinic and validate
            const clinic = await Clinic.findByPk(clinicId);
            if (!clinic) {
                return {
                    success: false,
                    message: "Clinic not found",
                    error: "Clinic with the provided ID does not exist"
                };
            }

            if (user.clinicId != clinicId) {
                return {
                    success: false,
                    message: "Forbidden",
                    error: "Forbidden"
                };
            }

            // Ensure user has a Stripe customer ID
            let stripeCustomerId = user.stripeCustomerId;
            if (!stripeCustomerId) {
                const stripeCustomer = await this.stripeService.createCustomer(
                    user.email,
                    `${user.firstName} ${user.lastName}`
                );
                stripeCustomerId = stripeCustomer.id;

                // Save Stripe customer ID to user
                await user.update({ stripeCustomerId });
            }

            // Get Stripe subscription product and price from environment
            const stripeProductId = process.env.STRIPE_SUBSCRIPTION_PRODUCT;
            const stripePriceId = process.env.STRIPE_SUBSCRIPTION_PRICE;

            if (!stripeProductId || !stripePriceId) {
                return {
                    success: false,
                    message: "Subscription not configured",
                    error: "STRIPE_SUBSCRIPTION_PRODUCT or STRIPE_SUBSCRIPTION_PRICE environment variables not set"
                };
            }

            // Create Stripe checkout session
            const checkoutSession = await this.stripeService.checkoutSub({
                line_items: [{
                    price: stripePriceId,
                    quantity: 1
                }],
                stripeCustomerId: stripeCustomerId,
                metadata: {
                    userId: userId,
                    clinicId: clinicId,
                }
            });

            return {
                success: true,
                message: "Clinic subscription checkout session created successfully",
                data: {
                    paymentUrl: checkoutSession.url!
                }
            };

        } catch (error) {
            console.error('Error creating clinic subscription:', error);
            return {
                success: false,
                message: "Failed to create clinic subscription",
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}

export default PaymentService;
export { SubscribeTreatmentResult, SubscribeClinicResult };