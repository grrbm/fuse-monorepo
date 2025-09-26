import Stripe from "stripe";

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export const stripeConfig: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  apiVersion: '2024-06-20'
};

// Validate required environment variables
if (!stripeConfig.secretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!stripeConfig.webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});