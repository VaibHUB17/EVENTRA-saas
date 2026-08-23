"use server";

import { getStripe } from '@/lib/stripe';

export async function createStripeLoginLink(stripeAccountId : string) {
    if(!stripeAccountId) {
        throw new Error("Stripe account ID is required to create a login link.");
    } 

    try{
        const stripe = getStripe();
        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
        return loginLink.url; 
        
    }
    catch (error) {
        console.error("Error creating Stripe login link:", error);
        throw new Error("Failed to create Stripe login link.");
    }
}