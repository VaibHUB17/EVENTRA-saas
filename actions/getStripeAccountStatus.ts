"use server";

import { getStripe } from "@/lib/stripe";

export type AccountStatus = {
  isActive: boolean;
  requiresInformation: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

export async function getStripeAccountStatus(
  stripeAccountId: string,
): Promise<AccountStatus> {
  if (!stripeAccountId) {
    throw new Error("Stripe account ID is required to get account status.");
  }

  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(stripeAccountId);

    return {
      isActive:
        account.details_submitted &&
        !account.requirements?.currently_due?.length,
      requiresInformation: !!(
        account.requirements?.currently_due?.length ||
        account.requirements?.eventually_due?.length ||
        account.requirements?.past_due?.length
      ),
      requirements: {
        currently_due: account.requirements?.currently_due || [],
        eventually_due: account.requirements?.eventually_due || [],
        past_due: account.requirements?.past_due || [],
      },
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    };
  } catch (error) {
    console.error("Error retrieving Stripe account:", error);
    throw new Error("Failed to retrieve Stripe account status.");
  }
}
