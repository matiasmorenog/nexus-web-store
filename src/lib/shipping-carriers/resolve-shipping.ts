import { db } from "@/lib/db";
import { formatMercadoEnviosDeliveryWindow } from "@/lib/mercado-envios";
import {
  quoteMercadoEnvios,
  type MercadoEnviosQuote,
} from "@/lib/mercado-envios/server";
import type { MercadoEnviosCarrierId } from "@/lib/mercado-envios/types";
import { isMercadoEnviosCarrierId } from "@/lib/shipping-carriers/format";
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

async function quoteCarrierForStore({
  storeId,
  zip,
  carrierId,
  items,
  orderSubtotal,
}: {
  storeId: string;
  zip: string;
  carrierId: MercadoEnviosCarrierId;
  items?: ShippingQuoteLineInput[];
  orderSubtotal?: number;
}): Promise<MercadoEnviosQuote> {
  const { settings, itemCount, totalWeightGrams } = await buildQuoteContext(
    storeId,
    items,
  );

  return quoteMercadoEnvios({
    storeId,
    destinationZip: zip.trim(),
    originZip: settings.originZip,
    carrierId,
    mercadoLibreQuoteItemId: settings.mercadoLibreQuoteItemId || null,
    defaultWeightGrams: settings.defaultWeightGrams,
    totalWeightGrams,
    itemCount,
    orderSubtotal,
  });
}

function toCheckoutQuoteOption(
  quote: MercadoEnviosQuote,
  carrierId: MercadoEnviosCarrierId,
): CheckoutShippingQuoteOption {
  return {
    carrierId,
    carrier: quote.carrier,
    service: quote.service,
    cost: quote.cost,
    deliveryWindow: formatMercadoEnviosDeliveryWindow(
      quote.deliveryDaysMin,
      quote.deliveryDaysMax,
    ),
    estimatedDelivery: quote.estimatedDelivery.toISOString(),
    demoMode: quote.demoMode,
    source: quote.source,
  };
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
    isMercadoEnviosCarrierId(requested) &&
    settings.enabledCarrierIds.includes(requested)
      ? requested
      : settings.enabledCarrierIds[0];

  const quote = await quoteCarrierForStore({
    storeId: input.storeId,
    zip: input.zip,
    carrierId,
    items: input.items,
    orderSubtotal: input.orderSubtotal,
  });
  return quote.cost;
}

/** Quotes every enabled carrier for checkout picker. */
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
    settings.enabledCarrierIds.map(async (carrierId) => {
      const quote = await quoteCarrierForStore({
        storeId,
        zip,
        carrierId,
        items,
        orderSubtotal,
      });
      return toCheckoutQuoteOption(quote, carrierId);
    }),
  );

  return quotes;
}

/** @deprecated Prefer quoteCheckoutShippingOptions — single preferred quote. */
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
}): Promise<MercadoEnviosQuote | null> {
  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled || settings.enabledCarrierIds.length === 0) {
    return null;
  }

  const requested = carrierId?.trim() ?? "";
  const resolved =
    isMercadoEnviosCarrierId(requested) &&
    settings.enabledCarrierIds.includes(requested)
      ? requested
      : settings.enabledCarrierIds[0];

  return quoteCarrierForStore({
    storeId,
    zip,
    carrierId: resolved,
    items,
    orderSubtotal,
  });
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

export function resolveCheckoutCarrierId(
  requested: string | null | undefined,
  enabledCarrierIds: readonly MercadoEnviosCarrierId[],
): MercadoEnviosCarrierId | null {
  if (enabledCarrierIds.length === 0) return null;
  const trimmed = requested?.trim() ?? "";
  if (isMercadoEnviosCarrierId(trimmed) && enabledCarrierIds.includes(trimmed)) {
    return trimmed;
  }
  return enabledCarrierIds[0] ?? null;
}
