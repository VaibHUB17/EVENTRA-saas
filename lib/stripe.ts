import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not defined in the environment variables.",
    );
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-06-24.dahlia",
  });
}
