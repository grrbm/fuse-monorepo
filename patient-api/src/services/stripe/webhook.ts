import Stripe from 'stripe';
import Payment from '../../models/Payment';
import Order, { OrderStatus } from '../../models/Order';
import StripeService from '.';
import Subscription from '../../models/Subscription';
import Clinic, { PaymentStatus } from '../../models/Clinic';
import BrandSubscription, { BrandSubscriptionStatus } from '../../models/BrandSubscription';
import User from '../../models/User';
import BrandSubscriptionPlans from '../../models/BrandSubscriptionPlans';
import OrderService from '../order.service';
import MDAuthService from '../mdIntegration/MDAuth.service';
import MDCaseService from '../mdIntegration/MDCase.service';
import Treatment from '../../models/Treatment';


export const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
    console.log('💳 Payment succeeded:', paymentIntent.id);

    // Find payment record
    const payment = await Payment.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: [{ model: Order, as: 'order' }]
    });

    if (payment) {
        // Update payment status
        await payment.updateFromStripeEvent({ object: paymentIntent });

        // Update order status
        await payment.order.updateStatus(OrderStatus.PAID);

        console.log('✅ Order updated to paid status:', payment.order.orderNumber);
    } else {
        // This is likely a subscription payment, not an order payment - ignore silently
        console.log('ℹ️ Payment intent not associated with order (likely subscription):', paymentIntent.id);
    }
};

export const handlePaymentIntentFailed = async (failedPayment: Stripe.PaymentIntent): Promise<void> => {
    console.log('❌ Payment failed:', failedPayment.id);

    // Find payment record
    const failedPaymentRecord = await Payment.findOne({
        where: { stripePaymentIntentId: failedPayment.id },
        include: [{ model: Order, as: 'order' }]
    });

    if (failedPaymentRecord) {
        // Update payment status
        await failedPaymentRecord.updateFromStripeEvent({ object: failedPayment });

        // Update order status
        await failedPaymentRecord.order.updateStatus(OrderStatus.CANCELLED);

        console.log('❌ Order updated to cancelled status:', failedPaymentRecord.order.orderNumber);
    }
};

export const handlePaymentIntentCanceled = async (cancelledPayment: Stripe.PaymentIntent): Promise<void> => {
    console.log('🚫 Payment cancelled:', cancelledPayment.id);

    // Find payment record
    const cancelledPaymentRecord = await Payment.findOne({
        where: { stripePaymentIntentId: cancelledPayment.id },
        include: [{ model: Order, as: 'order' }]
    });

    if (cancelledPaymentRecord) {
        // Update payment status
        await cancelledPaymentRecord.updateFromStripeEvent({ object: cancelledPayment });

        // Update order status
        await cancelledPaymentRecord.order.updateStatus(OrderStatus.CANCELLED);

        console.log('🚫 Order updated to cancelled status:', cancelledPaymentRecord.order.orderNumber);
    }
};

export const handleChargeDisputeCreated = async (dispute: Stripe.Dispute): Promise<void> => {
    console.log('⚠️ Dispute created:', dispute.id);

    // Find payment by charge ID
    const disputedPayment = await Payment.findOne({
        where: { stripeChargeId: dispute.charge },
        include: [{ model: Order, as: 'order' }]
    });

    if (disputedPayment) {
        // Update order status to refunded (dispute handling)
        await disputedPayment.order.updateStatus(OrderStatus.REFUNDED);
        console.log('⚠️ Order marked as disputed:', disputedPayment.order.orderNumber);
    }
};

export const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session): Promise<void> => {
    console.log('🛒 Checkout session completed:', session.id);

    // Handle subscription checkout completion
    if (session.mode === 'subscription' && session.metadata) {
        const { orderId, clinicId, userId, planType } = session.metadata;
        const { subscription } = session;

        console.log(" subscription ", subscription)

        let createSub = false

        // Handle brand subscription
        if (userId && planType) {
            const user = await User.findByPk(userId);
            if (user && user.role === 'brand') {
                console.log("Creating brand subscription for user:", userId);

                const selectedPlan = await BrandSubscriptionPlans.getPlanByType(planType as any);

                if (selectedPlan) {
                    const brandSub = await BrandSubscription.create({
                        userId: userId,
                        planType: planType as any,
                        status: BrandSubscriptionStatus.PROCESSING,
                        stripeSubscriptionId: subscription as string,
                        stripeCustomerId: session.customer as string,
                        stripePriceId: selectedPlan.stripePriceId,
                        monthlyPrice: selectedPlan.monthlyPrice
                    });
                    console.log('✅ Brand subscription created:', brandSub.id);
                }
                return; // Exit early for brand subscriptions
            }
        }

        // Handle existing clinic/order subscriptions
        if (orderId) {
            const order = await Order.findByPk(orderId);
            if (order) {
                createSub = true
                console.log("Order found")
            }
        } else if (clinicId) {
            const clinic = await Clinic.findByPk(clinicId);
            if (clinic) {
                createSub = true
                console.log("Clinic found")
            }
        }

        if (createSub) {
            console.log("Creating sub")
            const sub = await Subscription.create({
                ...(orderId && { orderId: orderId }),
                ...(clinicId && { clinicId: clinicId }),
                stripeSubscriptionId: subscription as string
            })
            console.log('✅ Subscription created:', sub.id);
        }
    }
};

export const handleInvoicePaid = async (invoice: Stripe.Invoice): Promise<void> => {
    console.log('Invoice paid:', invoice.id);

    const subItem = invoice?.lines?.data[0]
    const subscriptionId = (subItem?.subscription || subItem?.parent?.subscription_item_details?.subscription) as string

    console.log('🔍 Invoice subscription ID from webhook:', subscriptionId);
    console.log('🔍 Invoice details:', {
        id: invoice.id,
        customer: invoice.customer,
        linesCount: invoice.lines?.data?.length
    });

    if (subscriptionId && typeof subscriptionId === 'string') {
        // Check for brand subscription first
        const brandSub = await BrandSubscription.findOne({
            where: {
                stripeSubscriptionId: subscriptionId
            }
        });

        console.log('🔍 Brand subscription found in DB:', brandSub ? {
            id: brandSub.id,
            stripeSubscriptionId: brandSub.stripeSubscriptionId,
            status: brandSub.status,
            userId: brandSub.userId
        } : 'None');

        if (brandSub) {
            // Handle brand subscription payment
            const stripeService = new StripeService();
            try {
                const stripeSubscription = await stripeService.getSubscription(subscriptionId);

                // Extract period dates safely  
                const subscription = stripeSubscription as any; // Type assertion for Stripe subscription
                const periodStart = subscription.current_period_start
                    ? new Date(subscription.current_period_start * 1000)
                    : new Date();
                const periodEnd = subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000)
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

                await brandSub.activate({
                    subscriptionId: subscriptionId,
                    customerId: subscription.customer as string,
                    currentPeriodStart: periodStart,
                    currentPeriodEnd: periodEnd
                });

                console.log('✅ Brand subscription activated:', brandSub.id);
            } catch (error) {
                console.error('Error activating brand subscription:', error);
                // Fallback activation without period data
                await brandSub.updateProcessing(subscriptionId);
            }
            return; // Exit early for brand subscriptions
        }

        // Handle existing clinic/order subscriptions
        const sub = await Subscription.findOne({
            where: {
                stripeSubscriptionId: subscriptionId
            }
        });

        console.log('🔍 Regular subscription found in DB:', sub ? {
            id: sub.id,
            stripeSubscriptionId: sub.stripeSubscriptionId,
            status: sub.status,
            orderId: sub.orderId,
            clinicId: sub.clinicId
        } : 'None');

        if (sub) {
            await sub.markSubAsPaid();
            console.log('✅ Subscription updated to paid:', sub.id);

            if (sub.orderId) {
                const order = await Order.findByPk(sub.orderId);
                if (order) {
                    await order.update({
                        status: PaymentStatus.PAID
                    })
                    console.log("Sending new order ", order.shippingOrders.length)

                    const orderService = new OrderService()

                    const pharmacyOrder = orderService.createPharmacyOrder(order)
                    console.log("Pharmacy order", pharmacyOrder)
                }
            }
            if (sub.clinicId) {
                const clinic = await Clinic.findByPk(sub.clinicId);
                if (clinic) {
                    await clinic.update({
                        active: true,
                        status: PaymentStatus.PAID
                    })
                }
            }
        }
    }
};

export const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice): Promise<void> => {
    console.log('❌ Invoice payment failed:', invoice.id);

    const subItem = invoice?.lines?.data[0]
    const subscriptionId = (subItem?.subscription || subItem?.parent?.subscription_item_details?.subscription) as string

    const stripeService = new StripeService();

    if (subscriptionId && typeof subscriptionId === 'string') {
        // Check for brand subscription first
        const brandSub = await BrandSubscription.findOne({
            where: {
                stripeSubscriptionId: subscriptionId
            }
        });

        if (brandSub) {
            if (brandSub.status === BrandSubscriptionStatus.CANCELLED) {
                console.warn('⚠️ Brand subscription has been cancelled', subscriptionId);
                return;
            }

            try {
                const subscriptionResponse = await stripeService.getSubscription(subscriptionId);
                const validUntil = new Date((subscriptionResponse as any).current_period_end * 1000);

                await brandSub.markPaymentDue(validUntil);
                console.log('⚠️ Brand subscription marked as payment due until:', validUntil.toISOString());
            } catch (error) {
                console.error('Error handling brand subscription payment failure:', error);
                await brandSub.markPastDue();
            }
            return; // Exit early for brand subscriptions
        }

        // Handle existing clinic/order subscriptions
        const sub = await Subscription.findOne({
            where: {
                stripeSubscriptionId: subscriptionId
            }
        });

        if (sub) {
            if (sub.orderId) {
                const order = await Order.findByPk(sub.orderId);
                if (order) {
                    await order.update({
                        status: OrderStatus.PAYMENT_DUE
                    })
                }
            }
            if (sub.clinicId) {
                const clinic = await Clinic.findByPk(sub.clinicId);
                if (clinic) {
                    await clinic.update({
                        status: PaymentStatus.PAYMENT_DUE
                    })
                }
            }

            if (sub.status == PaymentStatus.CANCELLED) {
                console.warn('⚠️ Subscription has been cancelled', subscriptionId);
                return
            }

            const subscriptionResponse = await stripeService.getSubscription(subscriptionId as string);
            const currentPeriodEnd = subscriptionResponse.items.data[0]

            if (currentPeriodEnd?.current_period_end) {
                const validUntil = new Date(currentPeriodEnd?.current_period_end * 1000);

                await sub.markSubAsPaymentDue(validUntil);
                console.log('⚠️ Subscription order marked as payment due until:', validUntil.toISOString());
            }
        } else {
            console.warn('⚠️ No subscription found for failed payment:', subscriptionId);
        }
    } else {
        console.warn('⚠️ No subscription ID found in failed invoice:', invoice.id);
    }
};

export const handleSubscriptionDeleted = async (subscription: Stripe.Subscription): Promise<void> => {
    console.log('Subscription Cancel:', subscription.id);

    const { id: subscriptionId } = subscription;

    // Check for brand subscription first
    const brandSub = await BrandSubscription.findOne({
        where: {
            stripeSubscriptionId: subscriptionId
        }
    });

    if (brandSub) {
        await brandSub.cancel();
        console.log('✅ Brand subscription canceled:', brandSub.id);
        return; // Exit early for brand subscriptions
    }

    // Handle existing clinic/order subscriptions
    const sub = await Subscription.findOne({
        where: {
            stripeSubscriptionId: subscriptionId
        }
    });

    if (sub) {
        await sub.markSubAsCanceled();
        console.log('✅ Subscription updated to canceled:', sub.id);

        if (sub.orderId) {
            const order = await Order.findByPk(sub.orderId);
            if (order) {
                await order.update({
                    status: OrderStatus.CANCELLED
                })
            }
        }

        if (sub.clinicId) {
            const clinic = await Clinic.findByPk(sub.clinicId);
            if (clinic) {
                await clinic.update({
                    active: false,
                    status: PaymentStatus.CANCELLED
                })
            }
        }
    }
};

/**
 * This event fires when:
  - A payment method is authorized (validated) but not yet captured
  - The amount_capturable field on the PaymentIntent becomes greater than 0
  - You're using manual capture mode (capture_method: 'manual')
 * @param paymentIntent
 */
export const handlePaymentIntentAmountCapturableUpdated = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
    console.log('payment_intent.amount_capturable_updated:', paymentIntent.id);

    // Find payment record to get associated order
    const payment = await Payment.findOne({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: [
            {
                model: Order,
                as: 'order',
                include: [
                    { model: User, as: 'user' },
                    { model: Treatment, as: 'treatment' }
                ]
            }
        ]
    });

    if (!payment || !payment.order || !payment.order.user) {
        console.log('ℹ️ Payment intent not associated with order or user not found:', paymentIntent.id);
        return;
    }

    const user = payment.order.user;
    const order = payment.order;
    const treatment = payment.order.treatment;

    // Check if user has mdPatientId
    if (!user.mdPatientId) {
        console.log('⚠️ User does not have mdPatientId:', user.id);
        return;
    }

    // Check if order already has mdCaseId
    if (order.mdCaseId) {
        console.log('ℹ️ Order already has mdCaseId:', order.mdCaseId);
        return;
    }

    try {
        // Get MD Integration access token
        const tokenResponse = await MDAuthService.generateToken();

        // Create case using MD Integration
        const caseQuestions = order.questionnaireAnswers
            ? Object.entries(order.questionnaireAnswers).map(([question, answer]) => ({
                question: question,
                answer: String(answer),
                type: "string"
            }))
            : [];

        // Determine case offerings based on environment
        let caseOfferings: { offering_id: string }[] = [];

        if (process.env.NODE_ENV !== 'production') {
            // Always use test offering in non-production environments
            caseOfferings = [
                {
                    offering_id: "3c3d0118-e362-4466-9c92-d852720c5a41"
                }
            ];
        } else if (treatment && treatment.mdCaseId) {
            // Use treatment's mdCaseId for offering in production
            caseOfferings = [
                {
                    offering_id: treatment.mdCaseId
                }
            ];
        }

        const caseData = {
            patient_id: user.mdPatientId,
            metadata: `orderId: ${order.id}`,
            hold_status: false,
            case_questions: caseQuestions,
            case_offerings: caseOfferings,
        };

        const caseResponse = await MDCaseService.createCase(caseData, tokenResponse.access_token);

        // Save the case ID to the order
        await order.update({
            mdCaseId: caseResponse.case_id
        });

        console.log('✅ MD Integration case created and saved to order:', {
            orderId: order.id,
            caseId: caseResponse
        });

    } catch (error) {
        console.error('❌ Error creating MD Integration case:', error);
    }
};


export const processStripeWebhook = async (event: Stripe.Event): Promise<void> => {
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
            break;

        case 'payment_intent.payment_failed':
            await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
            break;

        case 'payment_intent.canceled':
            await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
            break;

        case 'charge.dispute.created':
            await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
            break;

        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
            break;

        case 'invoice.paid':
            await handleInvoicePaid(event.data.object as Stripe.Invoice);
            break;
        case "invoice.payment_failed":
            await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
            break;

        case "customer.subscription.deleted":
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
            break;
        case "payment_intent.amount_capturable_updated":
            await handlePaymentIntentAmountCapturableUpdated(event.data.object as Stripe.PaymentIntent)
            break;


        default:
            console.log(`🔍 Unhandled event type ${event.type}`);
    }
};