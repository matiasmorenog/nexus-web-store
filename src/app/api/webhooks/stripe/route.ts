import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  cancelStripeSessionOrder,
  createStripeClient,
  markStripeSessionPaid,
  resolveStripeCredentials,
} from "@/lib/payments/stripe";
import { getStoreId } from "@/lib/store-context";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const storeId = await getStoreId();
  const credentials = await resolveStripeCredentials(storeId);
  if (!credentials) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const stripe = createStripeClient(credentials.secretKey);
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, credentials.webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await markStripeSessionPaid(event.data.object, storeId);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await cancelStripeSessionOrder(event.data.object, storeId);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
