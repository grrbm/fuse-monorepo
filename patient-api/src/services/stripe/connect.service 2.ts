import Stripe from 'stripe';
import Clinic from '../../models/Clinic';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

export class StripeConnectService {
  /**
   * Create or retrieve a Stripe Connect account for a clinic
   */
  async createOrGetConnectAccount(clinicId: string): Promise<string> {
    const clinic = await Clinic.findByPk(clinicId);
    
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // If clinic already has a Stripe account, return it
    if (clinic.stripeAccountId) {
      console.log(`✅ Clinic ${clinicId} already has Stripe account: ${clinic.stripeAccountId}`);
      return clinic.stripeAccountId;
    }

    // Create a new Express Connect account
    console.log(`🔄 Creating new Stripe Connect account for clinic ${clinicId}`);
    
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: clinic.name ? `${clinic.slug}@fuse-brands.com` : undefined,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'company',
      metadata: {
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicSlug: clinic.slug,
      }
    });

    // Save account ID to clinic
    await clinic.update({
      stripeAccountId: account.id,
      stripeAccountType: 'express',
    });

    console.log(`✅ Stripe Connect account created: ${account.id} for clinic ${clinicId}`);
    
    return account.id;
  }

  /**
   * Create an Account Session for embedded components
   * This allows the frontend to access Stripe Connect UI
   */
  async createAccountSession(clinicId: string): Promise<string> {
    const clinic = await Clinic.findByPk(clinicId);
    
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // Ensure clinic has a Stripe account
    let accountId = clinic.stripeAccountId;
    if (!accountId) {
      accountId = await this.createOrGetConnectAccount(clinicId);
    }

    console.log(`🔄 Creating Account Session for clinic ${clinicId}, account ${accountId}`);

    // Create the account session with embedded components configuration
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: { enabled: true },
        payments: { 
          enabled: true,
          features: {
            refund_management: true,
            dispute_management: true,
            capture_payments: true,
          }
        },
        payouts: { 
          enabled: true,
          features: {
            standard_payouts: true,
          }
        },
        balances: { 
          enabled: true,
          features: {
            standard_payouts: true,
          }
        },
        notification_banner: { enabled: true },
      },
    });

    console.log(`✅ Account Session created for clinic ${clinicId}`);
    
    return accountSession.client_secret;
  }

  /**
   * Get the onboarding status of a clinic's Stripe Connect account
   */
  async getAccountStatus(clinicId: string): Promise<{
    connected: boolean;
    onboardingComplete: boolean;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    accountId?: string;
    requirements?: {
      currently_due: string[];
      eventually_due: string[];
      past_due: string[];
    };
  }> {
    const clinic = await Clinic.findByPk(clinicId);
    
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    if (!clinic.stripeAccountId) {
      return {
        connected: false,
        onboardingComplete: false,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      };
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(clinic.stripeAccountId);

    // Update local record if status changed
    const needsUpdate = 
      clinic.stripeDetailsSubmitted !== account.details_submitted ||
      clinic.stripeChargesEnabled !== account.charges_enabled ||
      clinic.stripePayoutsEnabled !== account.payouts_enabled;

    if (needsUpdate) {
      await clinic.update({
        stripeDetailsSubmitted: account.details_submitted,
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete: account.details_submitted && account.charges_enabled && account.payouts_enabled,
        stripeOnboardedAt: (account.details_submitted && account.charges_enabled && account.payouts_enabled && !clinic.stripeOnboardedAt) 
          ? new Date() 
          : clinic.stripeOnboardedAt,
      });
    }

    return {
      connected: true,
      onboardingComplete: account.details_submitted && account.charges_enabled && account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      accountId: account.id,
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
      }
    };
  }

  /**
   * Handle account.updated webhook event
   */
  async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    console.log(`📬 Account updated webhook received for account: ${account.id}`);

    // Find clinic by Stripe account ID
    const clinic = await Clinic.findOne({
      where: { stripeAccountId: account.id }
    });

    if (!clinic) {
      console.warn(`⚠️ No clinic found for Stripe account: ${account.id}`);
      return;
    }

    // Update clinic with latest account status
    const wasIncomplete = !clinic.stripeOnboardingComplete;
    const isNowComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled;

    await clinic.update({
      stripeDetailsSubmitted: account.details_submitted,
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeOnboardingComplete: isNowComplete,
      stripeOnboardedAt: (isNowComplete && !clinic.stripeOnboardedAt) 
        ? new Date() 
        : clinic.stripeOnboardedAt,
    });

    if (wasIncomplete && isNowComplete) {
      console.log(`🎉 Clinic ${clinic.id} completed Stripe Connect onboarding!`);
      // Here you could send a notification to the clinic or trigger other events
    }

    console.log(`✅ Clinic ${clinic.id} Stripe status updated`);
  }

  /**
   * Create a transfer to a connected account
   * This is used to pay brands/pharmacies their share
   */
  async createTransfer(params: {
    amount: number; // in cents
    currency: string;
    destinationAccountId: string;
    description: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    const { amount, currency, destinationAccountId, description, metadata } = params;

    console.log(`💸 Creating transfer of ${amount} ${currency} to account ${destinationAccountId}`);

    const transfer = await stripe.transfers.create({
      amount,
      currency,
      destination: destinationAccountId,
      description,
      metadata,
    });

    console.log(`✅ Transfer created: ${transfer.id}`);

    return transfer;
  }

  /**
   * Create an account link for onboarding (alternative to embedded components)
   * This can be used as a fallback or for email invitations
   */
  async createAccountLink(clinicId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const clinic = await Clinic.findByPk(clinicId);
    
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    let accountId = clinic.stripeAccountId;
    if (!accountId) {
      accountId = await this.createOrGetConnectAccount(clinicId);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }
}

export default new StripeConnectService();

