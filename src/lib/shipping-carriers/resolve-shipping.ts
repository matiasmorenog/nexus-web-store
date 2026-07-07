import {
  quoteMercadoEnvios,
  type MercadoEnviosQuote,
} from "@/lib/mercado-envios";
import { getStoreShippingSettings } from "@/lib/shipping-carriers/query";

export async function resolveCheckoutShippingCost({
  storeId,
  zip,
  flatRate,
  isPickup,
}: {
  storeId: string;
  zip: string;
  flatRate: number;
  isPickup: boolean;
}): Promise<number> {
  if (isPickup) return 0;

  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled) {
    return Math.max(0, flatRate);
  }

  return quoteMercadoEnvios({
    zip: zip.trim(),
    baseRate: flatRate,
    carrierId: settings.preferredCarrierId,
  }).cost;
}

export async function quoteCheckoutShipping({
  storeId,
  zip,
  flatRate,
}: {
  storeId: string;
  zip: string;
  flatRate: number;
}): Promise<MercadoEnviosQuote | null> {
  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled) {
    return null;
  }

  return quoteMercadoEnvios({
    zip: zip.trim(),
    baseRate: flatRate,
    carrierId: settings.preferredCarrierId,
  });
}
