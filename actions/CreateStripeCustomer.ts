"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function createStripeConnectCustomer() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const clerkUser = await currentUser();

  // Check if user already has a connect account
  let existingUser = await convex.query(api.users.getUserById, {
    userId,
  });

  if (!existingUser) {
    await convex.mutation(api.users.updateUser, {
      userId,
      name:
        `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim() ||
        clerkUser?.username ||
        "Seller",
      email: clerkUser?.emailAddresses[0]?.emailAddress || "",
    });

    existingUser = await convex.query(api.users.getUserById, {
      userId,
    });
  }

  const existingStripeConnectId = existingUser?.stripeConnectId;

  if (existingStripeConnectId) {
    return { account: existingStripeConnectId };
  }

  const displayName =
    `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim() ||
    clerkUser?.username ||
    "Seller";

  const contactEmail = clerkUser?.emailAddresses[0]?.emailAddress || "";

  // Create a connected account with Accounts v2.
  const accountResponse = await fetch(
    "https://api.stripe.com/v2/core/accounts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Stripe-Version": "2026-06-24.dahlia",
      },
      body: JSON.stringify({
        contact_email: contactEmail,
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
    error?: { message?: string };
  };

  if (!accountResponse.ok || !accountData.id) {
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
