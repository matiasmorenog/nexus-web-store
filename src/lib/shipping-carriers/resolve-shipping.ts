import { db } from "@/lib/db";
import {
  quoteMercadoEnvios,
  type MercadoEnviosQuote,
} from "@/lib/mercado-envios/server";
import { getStoreShippingSettings } from "@/lib/shipping-carriers/query";
import type { ShippingQuoteLineInput } from "@/lib/shipping-carriers/types";

type ResolveShippingQuoteInput = {
  storeId: string;
  zip: string;
  isPickup: boolean;
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

async function quoteForStore({
  storeId,
  zip,
  items,
  orderSubtotal,
}: Omit<ResolveShippingQuoteInput, "isPickup">): Promise<MercadoEnviosQuote> {
  const { settings, itemCount, totalWeightGrams } = await buildQuoteContext(
    storeId,
    items,
  );

  return quoteMercadoEnvios({
    storeId,
    destinationZip: zip.trim(),
    originZip: settings.originZip,
    carrierId: settings.preferredCarrierId,
    mercadoLibreQuoteItemId: settings.mercadoLibreQuoteItemId || null,
    defaultWeightGrams: settings.defaultWeightGrams,
    totalWeightGrams,
    itemCount,
    orderSubtotal,
  });
}

export async function resolveCheckoutShippingCost(
  input: ResolveShippingQuoteInput,
): Promise<number> {
  if (input.isPickup) return 0;

  const settings = await getStoreShippingSettings(input.storeId);
  if (!settings.carriersEnabled) {
    return 0;
  }

  const quote = await quoteForStore(input);
  return quote.cost;
}

export async function quoteCheckoutShipping({
  storeId,
  zip,
  items,
  orderSubtotal,
}: {
  storeId: string;
  zip: string;
  items?: ShippingQuoteLineInput[];
  orderSubtotal?: number;
}): Promise<MercadoEnviosQuote | null> {
  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled) {
    return null;
  }

  return quoteForStore({ storeId, zip, items, orderSubtotal });
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
