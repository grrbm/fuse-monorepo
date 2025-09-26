import Stripe from 'stripe';
import { stripe } from './config';
import { BillingInterval } from '../../models/TreatmentPlan';

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"



interface CheckoutSubParams {
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
  stripeCustomerId: string;
  metadata: {
    userId: string;
    orderId?: string;
    clinicId?: string;
    treatmentId?: string;
  }
}


class StripeService {
  async checkoutSub({
    line_items,
    stripeCustomerId,
    metadata,
  }: CheckoutSubParams) {
    return stripe.checkout.sessions.create({
      line_items,
      customer: stripeCustomerId,
      mode: "subscription",
      cancel_url: `${FRONTEND_URL}/cancel`, // Assuming cart route
      success_url:
        `${FRONTEND_URL}/success`,
      metadata: metadata,
      saved_payment_method_options: {
        payment_method_save: "enabled",
      },
    });
  }

  async createCustomer(email: string, name?: string) {
    return stripe.customers.create({
      email,
      name
    });

  }

  async getCustomer(customerId: string) {
    return stripe.customers.retrieve(customerId);
  }

  async getPaymentIntent(paymentIntentId: string) {
    return stripe.paymentIntents.retrieve(
      paymentIntentId,
      { expand: ["customer", "invoice"] }
    );
  }

  async getInvoice(invoiceId: string) {
    return stripe.invoices.retrieve(invoiceId, {
      expand: ["subscription"]
    });
  }

  async getSubscription(subscriptionId: string) {
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string) {
    return stripe.subscriptions.cancel(subscriptionId);
  }




  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, string>
  ) {
    // Ensure minimum charge amount for USD (50 cents)
    const minimumAmount = currency === 'usd' ? 0.50 : amount;
    const finalAmount = Math.max(amount, minimumAmount);

    console.log(`💰 Payment amount: $${amount} -> $${finalAmount} (minimum: $${minimumAmount})`);

    const paymentIntentParams: any = {
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency,
      customer: customerId,
      capture_method: 'manual',
      setup_future_usage: 'off_session', // Save payment method for future use
      automatic_payment_methods: {
        enabled: true,
      },
      payment_method_options: {
        card: {
          setup_future_usage: 'off_session' // Ensure card is saved
        }
      },
      metadata: metadata || {}
    };

    return stripe.paymentIntents.create(paymentIntentParams);
  }

  async capturePaymentIntent(paymentIntentId: string, amountToCapture?: number) {
    const captureParams: any = {
      expand: ['invoice']
    };
    if (amountToCapture) {
      captureParams.amount_to_capture = Math.round(amountToCapture * 100);
    }

    return stripe.paymentIntents.capture(paymentIntentId, captureParams);
  }


  async createSubscriptionAfterPayment({
    customerId,
    priceId,
    paymentMethodId,
    metadata,
    billingInterval = BillingInterval.MONTHLY,
  }: {
    customerId: string;
    priceId: string;
    paymentMethodId: string;
    metadata?: Record<string, string>;
    billingInterval?: BillingInterval;
  }) {
    try {
      // Calculate next billing cycle anchor based on billing interval
      const now = new Date();
      let nextBillingDate: Date;

      switch (billingInterval) {
        case 'quarterly':
          nextBillingDate = new Date(now);
          nextBillingDate.setMonth(now.getMonth() + 3);
          break;
        case 'biannual':
          nextBillingDate = new Date(now);
          nextBillingDate.setMonth(now.getMonth() + 6);
          break;
        case 'annual':
          nextBillingDate = new Date(now);
          nextBillingDate.setFullYear(now.getFullYear() + 1);
          break;
        case 'monthly':
        default:
          nextBillingDate = new Date(now);
          nextBillingDate.setMonth(now.getMonth() + 1);
          break;
      }

      // Ensure we don't go past the end of the month for monthly billing
      if (billingInterval === 'monthly' && nextBillingDate.getDate() !== now.getDate()) {
        // Handle edge case for end-of-month dates (e.g., Jan 31 -> Feb 28)
        nextBillingDate = new Date(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1, 0);
      }

      const billingCycleAnchor = Math.floor(nextBillingDate.getTime() / 1000);

      console.log(`📅 Setting subscription billing cycle anchor to: ${nextBillingDate.toISOString()} (${billingInterval} billing)`);

      // Create subscription starting at next billing cycle
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        default_payment_method: paymentMethodId,
        billing_cycle_anchor: billingCycleAnchor,
        proration_behavior: 'none', // Don't prorate - start fresh next cycle
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card']
        },
        metadata: {
          ...metadata,
          initial_payment_covered: 'true',
          next_billing_date: nextBillingDate.toISOString(),
          billing_interval: billingInterval
        }
      });

      console.log('✅ Subscription created after payment capture (next billing cycle):', subscription.id);
      console.log(`📅 Next billing will occur on: ${nextBillingDate.toISOString()}`);

      return subscription;
    } catch (error) {
      console.error('❌ Error creating subscription after payment:', error);
      throw error;
    }
  }


  // Product management methods
  async createProduct(params: Stripe.ProductCreateParams) {
    return stripe.products.create(params);
  }

  async getProduct(productId: string) {
    return stripe.products.retrieve(productId);
  }

  async updateProduct(productId: string, params: Stripe.ProductUpdateParams) {
    return stripe.products.update(productId, params);
  }

  // Price management methods
  async createPrice(params: Stripe.PriceCreateParams) {
    return stripe.prices.create(params);
  }

  async getPrice(priceId: string) {
    return stripe.prices.retrieve(priceId);
  }

  async updatePrice(priceId: string, params: Stripe.PriceUpdateParams) {
    return stripe.prices.update(priceId, params);
  }

  async deprecatePrice(priceId: string) {
    return stripe.prices.update(priceId, { active: false });
  }

  async upgradeSubscriptionStripe({
    stripeSubscriptionId,
    stripeItemId,
    stripePriceId,
  }: {
    stripeSubscriptionId: string;
    stripeItemId: string;
    stripePriceId: string;
  }) {
    return stripe.subscriptions.update(stripeSubscriptionId, {
      items: [
        {
          id: stripeItemId,
          deleted: true,
        },
        {
          price: stripePriceId,
        },
      ],
      proration_behavior: "none",
    });
  };

}

export default StripeService;
export { CheckoutSubParams };