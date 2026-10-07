import "server-only";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-paid-order";
import { decryptPaymentSecret } from "@/lib/payments/encryption";
import {
  isValidStripeSecretKey,
  isValidStripeWebhookSecret,
} from "@/lib/payments/stripe-format";

export type StripeCredentials = {
  secretKey: string;
  webhookSecret: string;
};

export type StripeLineItem = {
  name: string;
  quantity: number;
  unitAmount: number;
};

export async function resolveStripeCredentials(
  storeId: string,
): Promise<StripeCredentials | null> {
  const row = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      stripeEnabled: true,
      stripeSecretKeyEnc: true,
      stripeWebhookSecretEnc: true,
    },
  });

  if (!row?.stripeEnabled || !row.stripeSecretKeyEnc || !row.stripeWebhookSecretEnc) {
    return null;
  }

  try {
    const secretKey = decryptPaymentSecret(row.stripeSecretKeyEnc);
    const webhookSecret = decryptPaymentSecret(row.stripeWebhookSecretEnc);
    if (!isValidStripeSecretKey(secretKey) || !isValidStripeWebhookSecret(webhookSecret)) {
      return null;
    }
    return { secretKey, webhookSecret };
  } catch (error) {
    console.error("Failed to decrypt Stripe credentials:", error);
    return null;
  }
}

export function createStripeClient(secretKey: string) {
  return new Stripe(secretKey);
}

export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

function stripeLocale(locale: string): Stripe.Checkout.SessionCreateParams.Locale {
  if (locale.startsWith("it")) return "it";
  if (locale.startsWith("es-")) return "es-419";
  if (locale.startsWith("es")) return "es";
  return "auto";
}

/** Falls back to a single line when per-unit rounding would not match the order total. */
function buildStripeLineItems(
  items: StripeLineItem[],
  totalAmount: number,
  fallbackName: string,
): StripeLineItem[] {
  const valid = items.every(
    (item) => item.quantity > 0 && Number.isInteger(item.unitAmount) && item.unitAmount > 0,
  );
  const sum = items.reduce((acc, item) => acc + item.unitAmount * item.quantity, 0);

  if (valid && sum === totalAmount) return items;
  return [{ name: fallbackName, quantity: 1, unitAmount: totalAmount }];
}

export async function createStripeCheckoutSession({
  secretKey,
  orderId,
  storeId,
  currency,
  locale,
  items,
  totalAmount,
  fallbackItemName,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  secretKey: string;
  orderId: string;
  storeId: string;
  currency: string;
  locale: string;
  items: StripeLineItem[];
  totalAmount: number;
  fallbackItemName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = createStripeClient(secretKey);
  const metadata = { orderId, storeId };

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: buildStripeLineItems(items, totalAmount, fallbackItemName).map(
      (item) => ({
        quantity: item.quantity,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: item.unitAmount,
          product_data: { name: item.name },
        },
      }),
    ),
    client_reference_id: orderId,
    customer_email: customerEmail,
    locale: stripeLocale(locale),
    metadata,
    payment_intent_data: { metadata },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

async function findSessionOrder(session: Stripe.Checkout.Session, storeId: string) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return null;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, storeId: true, status: true },
  });

  return order && order.storeId === storeId ? order : null;
}

export async function markStripeSessionPaid(
  session: Stripe.Checkout.Session,
  storeId: string,
) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return;
  }

  const order = await findSessionOrder(session, storeId);
  if (!order) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  await db.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    },
  });
  await fulfillPaidOrder(order.id);
}

export async function cancelStripeSessionOrder(
  session: Stripe.Checkout.Session,
  storeId: string,
) {
  const order = await findSessionOrder(session, storeId);
  if (!order || order.status !== "PENDING") return;

  await db.order.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}
