import { headers } from "next/headers";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import Stripe from "stripe";
import { StripeCheckoutMetaData } from "@/actions/CreateStripeCheckoutSession";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  console.log("Stripe Webhook called");

  const body = await req.text();
  const header = await headers();
  const signature = header.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  console.log("Stripe Webhook body: ", body);

  let event: Stripe.Event;

  try {
    console.log("Attempting to construct webhook event");
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
    console.log("Webhook event constructed successfully: ", event);
  } catch (error) {
    console.error("Error constructing webhook event: ", error);
    return new Response("Error processing webhook", { status: 500 });
  }

  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata as StripeCheckoutMetaData | null;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (
      !metadata?.eventId ||
      !metadata.userId ||
      !metadata.waitingListId ||
      !paymentIntentId
    ) {
      console.error("Checkout session is missing required metadata", {
        sessionId: session.id,
        metadata,
      });
      return new Response("Invalid checkout session", { status: 400 });
    }
    console.log("Session metadata:", metadata);
    console.log("Convex client:", convex);

    try {
      const result = await convex.mutation(api.events.purchaseTicket, {
        eventId: metadata.eventId,
        userId: metadata.userId,
        waitingListId: metadata.waitingListId,
        paymentInfo: {
          paymentIntentId,
          amount: session.amount_total ?? 0,
        },
      });
      console.log("Purchase ticket mutation completed:", result);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
