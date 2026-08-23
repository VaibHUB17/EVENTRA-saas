"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex";

export async function createStripeConnectCustomer() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const clerkUser = await currentUser();

  const convex = getConvexClient();

  const displayName =
    `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim() ||
    clerkUser?.username ||
    "Seller";

  const contactEmail = clerkUser?.emailAddresses[0]?.emailAddress || "";

  // Check if user already has a connect account
  let existingUser = await convex.query(api.users.getUserById, {
    userId,
  });

  if (!existingUser) {
    await convex.mutation(api.users.updateUser, {
      userId,
      name: displayName,
      email: contactEmail,
    });

    existingUser = await convex.query(api.users.getUserById, {
      userId,
    });
  }

  const existingStripeConnectId = existingUser?.stripeConnectId;

  if (existingStripeConnectId) {
    return { account: existingStripeConnectId };
  }

  // Create a connected account with Accounts v2.
  const accountResponse = await fetch(
    "https://api.stripe.com/v2/core/accounts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
        "Stripe-Version": "2026-06-24.dahlia",
      },
      body: JSON.stringify({
        ...(contactEmail ? { contact_email: contactEmail } : {}),
        display_name: displayName,
        identity: {
          country: "US",
          entity_type: "individual",
        },
        dashboard: "express",
        configuration: {
          merchant: {
            capabilities: {
              card_payments: {
                requested: true,
              },
            },
          },
        },
        defaults: {
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
      }),
    },
  );

  const accountData = (await accountResponse.json()) as {
    id?: string;
    error?: { message?: string; code?: string };
  };

  if (!accountResponse.ok || !accountData.id) {
    console.error("Stripe Accounts v2 creation failed:", accountData);
    throw new Error(
      accountData.error?.message ||
        "Failed to create Stripe connected account.",
    );
  }

  // Update user with stripe connect id
  await convex.mutation(api.users.updateOrCreateUserStripeConnectId, {
    userId,
    stripeConnectId: accountData.id,
  });

  return { account: accountData.id };
}
