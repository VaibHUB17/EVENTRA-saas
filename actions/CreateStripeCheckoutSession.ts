"use server";

import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { getStripe } from "@/lib/stripe";
import { DURATIONS } from "@/convex/constant";
import baseURL from "@/lib/baseURL";

export type StripeCheckoutMetaData = {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
};

export async function createStripeCheckoutSession({
  eventId,
}: {
  eventId: Id<"events">;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const convex = getConvexClient();

  //Get event details from the database
  const event = await convex.query(api.events.getById, { eventId });
  if (!event) {
    throw new Error("Event not found");
  }

  //Get waiting list entry
  const queuePosition = await convex.query(api.waitingList.getQueuePosition, {
    eventId,
    userId,
  });

  if (!queuePosition || queuePosition.status !== "offered") {
    throw new Error("No valid ticket offer found");
  }

  const stripe = getStripe();

  const seller = await convex.query(api.users.getUserById, {
    userId: event.userId,
  });
  const stripeConnectId = seller?.stripeConnectId;

  if (!queuePosition.offerExpiresAt) {
    throw new Error("Ticket offer has no expiration date");
  }

  const metadata: StripeCheckoutMetaData = {
    eventId,
    userId,
    waitingListId: queuePosition._id,
  };

  // Create a Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: event.name,
            description: event.description,
          },
          unit_amount: Math.round(event.price * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.round(event.price * 100 * 0.01), // 1% fee
    },
    expires_at : Math.floor(Date.now()/1000) + DURATIONS.TICKET_OFFER /1000,   // 30 minutes (stripe checkout minimum expiration time)
    mode: "payment",
    success_url: `${baseURL}/tickets/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseURL}/event/${eventId}`,
      metadata,
  },{
    stripeAccount: stripeConnectId || undefined, // If the event creator has a Stripe Connect account, use it
  });

  return {  sessionId: session.id, sessionUrl: session.url };
}
