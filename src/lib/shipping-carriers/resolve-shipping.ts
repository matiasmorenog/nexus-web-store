import { db } from "@/lib/db";
import { getCarrierAdapter } from "@/lib/shipping-carriers/adapters";
import {
  isShippingCarrierId,
  type ShippingCarrierId,
} from "@/lib/shipping-carriers/carrier-catalog";
import { formatShippingDeliveryWindow } from "@/lib/shipping-carriers/format";
import { getStoreShippingSettings } from "@/lib/shipping-carriers/query";
import type {
  CheckoutShippingQuoteOption,
  ShippingQuoteLineInput,
} from "@/lib/shipping-carriers/types";

type ResolveShippingQuoteInput = {
  storeId: string;
  zip: string;
  isPickup: boolean;
  carrierId?: string | null;
  items?: ShippingQuoteLineInput[];
  orderSubtotal?: number;
};

async function buildQuoteContext(
  storeId: string,
  items?: ShippingQuoteLineInput[],
) {
  const settings = await getStoreShippingSettings(storeId);
  const itemCount = items?.reduce((sum, item) => sum + item.quantity, 0) ?? 1;
  const totalWeightGrams = settings.defaultWeightGrams * Math.max(1, itemCount);

  return {
    settings,
    itemCount,
    totalWeightGrams,
  };
}

async function quoteConfiguredCarrier({
  storeId,
  zip,
  carrierId,
  items,
  orderSubtotal,
}: {
  storeId: string;
  zip: string;
  carrierId: ShippingCarrierId;
  items?: ShippingQuoteLineInput[];
  orderSubtotal?: number;
}): Promise<CheckoutShippingQuoteOption | null> {
  const adapter = getCarrierAdapter(carrierId);
  if (!(await adapter.isConfigured(storeId))) {
    return null;
  }

  const { settings, itemCount, totalWeightGrams } = await buildQuoteContext(
    storeId,
    items,
  );

  try {
    const quote = await adapter.quote({
      storeId,
      destinationZip: zip.trim(),
      originZip: settings.originZip,
      totalWeightGrams,
      itemCount,
      orderSubtotal,
      mercadoLibreQuoteItemId: settings.mercadoLibreQuoteItemId || null,
    });

    return {
      carrierId: quote.carrierId,
      carrier: quote.carrier,
      service: quote.service,
      cost: quote.cost,
      deliveryWindow: formatShippingDeliveryWindow(
        quote.deliveryDaysMin,
        quote.deliveryDaysMax,
      ),
      estimatedDelivery: quote.estimatedDelivery.toISOString(),
      demoMode: quote.sandbox,
      sandbox: quote.sandbox,
      source: quote.source === "api" ? "api" : "fallback",
    };
  } catch (error) {
    console.warn(`Shipping quote failed for ${carrierId}:`, error);
    return null;
  }
}

export async function resolveCheckoutShippingCost(
  input: ResolveShippingQuoteInput,
): Promise<number> {
  if (input.isPickup) return 0;

  const settings = await getStoreShippingSettings(input.storeId);
  if (!settings.carriersEnabled || settings.enabledCarrierIds.length === 0) {
    return 0;
  }

  const requested = input.carrierId?.trim() ?? "";
  const carrierId =
    isShippingCarrierId(requested) &&
    settings.enabledCarrierIds.includes(requested)
      ? requested
      : settings.enabledCarrierIds[0];

  const quote = await quoteConfiguredCarrier({
    storeId: input.storeId,
    zip: input.zip,
    carrierId,
    items: input.items,
    orderSubtotal: input.orderSubtotal,
  });
  return quote?.cost ?? 0;
}

/** Quotes every enabled + configured carrier for checkout picker. */
export async function quoteCheckoutShippingOptions({
  storeId,
  zip,
  items,
  orderSubtotal,
}: {
  storeId: string;
  zip: string;
  items?: ShippingQuoteLineInput[];
  orderSubtotal?: number;
}): Promise<CheckoutShippingQuoteOption[]> {
  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled || settings.enabledCarrierIds.length === 0) {
    return [];
  }

  const quotes = await Promise.all(
    settings.enabledCarrierIds.map((carrierId) =>
      quoteConfiguredCarrier({
        storeId,
        zip,
        carrierId,
        items,
        orderSubtotal,
      }),
    ),
  );

  return quotes.filter((quote): quote is CheckoutShippingQuoteOption =>
    Boolean(quote),
  );
}

/** @deprecated Prefer quoteCheckoutShippingOptions */
export async function quoteCheckoutShipping({
  storeId,
  zip,
  items,
  orderSubtotal,
  carrierId,
}: {
  storeId: string;
  zip: string;
  items?: ShippingQuoteLineInput[];
  orderSubtotal?: number;
  carrierId?: string | null;
}): Promise<CheckoutShippingQuoteOption | null> {
  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled || settings.enabledCarrierIds.length === 0) {
    return null;
  }

  const requested = carrierId?.trim() ?? "";
  const resolved =
    isShippingCarrierId(requested) &&
    settings.enabledCarrierIds.includes(requested)
      ? requested
      : settings.enabledCarrierIds[0];

  return quoteConfiguredCarrier({
    storeId,
    zip,
    carrierId: resolved,
    items,
    orderSubtotal,
  });
}

export function resolveCheckoutCarrierId(
  requestedCarrierId: string | null | undefined,
  enabledCarrierIds: readonly ShippingCarrierId[],
): ShippingCarrierId | null {
  if (enabledCarrierIds.length === 0) return null;
  const trimmed = requestedCarrierId?.trim() ?? "";
  if (isShippingCarrierId(trimmed) && enabledCarrierIds.includes(trimmed)) {
    return trimmed;
  }
  return enabledCarrierIds[0] ?? null;
}

export async function estimateOrderSubtotalForQuote(
  storeId: string,
  items: ShippingQuoteLineInput[],
) {
  if (items.length === 0) return 0;

  const variants = await db.productVariant.findMany({
    where: {
      id: { in: items.map((item) => item.variantId) },
      product: { storeId },
    },
    select: { id: true, price: true },
  });

  return items.reduce((sum, item) => {
    const variant = variants.find((row) => row.id === item.variantId);
    if (!variant) return sum;
    return sum + Number(variant.price) * item.quantity;
  }, 0);
}
