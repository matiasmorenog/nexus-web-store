import { unstable_cache } from "next/cache";
import type { StoreShippingSettings } from "@prisma/client";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import {
  getMercadoEnviosTokenHintForAdmin,
  getMercadoEnviosTokenSource,
} from "@/lib/mercado-envios/resolve-token";
import { storeHasModule } from "@/lib/modules";
import { isMercadoEnviosCarrierId } from "@/lib/shipping-carriers/format";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type StoreCarrierSettingsData,
  type StoreShippingSettingsAdminData,
} from "@/lib/shipping-carriers/types";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export const SHIPPING_SETTINGS_CACHE_TAG = "shipping-settings";

function serializeCarrierSettings(
  row: StoreShippingSettings | null,
): StoreCarrierSettingsData {
  if (!row) return DEFAULT_SHIPPING_SETTINGS;

  return {
    carriersEnabled: row.carriersEnabled,
    preferredCarrierId: isMercadoEnviosCarrierId(row.preferredCarrierId)
      ? row.preferredCarrierId
      : DEFAULT_SHIPPING_SETTINGS.preferredCarrierId,
    originZip: row.originZip?.trim() || DEFAULT_SHIPPING_SETTINGS.originZip,
    mercadoLibreQuoteItemId: row.mercadoLibreQuoteItemId?.trim() ?? "",
    defaultWeightGrams:
      row.defaultWeightGrams > 0
        ? row.defaultWeightGrams
        : DEFAULT_SHIPPING_SETTINGS.defaultWeightGrams,
  };
}

export async function getStoreShippingSettingsForAdmin(
  storeId: string,
): Promise<StoreShippingSettingsAdminData> {
  const [row, store, source, tokenHint] = await Promise.all([
    db.storeShippingSettings.findUnique({
      where: { storeId },
    }),
    db.store.findUniqueOrThrow({
      where: { id: storeId },
      select: { allowPickup: true },
    }),
    getMercadoEnviosTokenSource(storeId),
    getMercadoEnviosTokenHintForAdmin(storeId),
  ]);

  return {
    ...serializeCarrierSettings(row),
    allowPickup: store.allowPickup,
    mercadoEnviosConfigured: source !== "none",
    mercadoEnviosTokenHint: tokenHint,
    mercadoEnviosSource: source,
  };
}

export async function getStoreShippingSettings(
  storeId: string,
): Promise<StoreCarrierSettingsData> {
  if (!(await storeHasModule(storeId, "shippingCarriers"))) {
    return { ...DEFAULT_SHIPPING_SETTINGS, carriersEnabled: false };
  }

  const cached = unstable_cache(
    async () => {
      const row = await db.storeShippingSettings.findUnique({
        where: { storeId },
      });
      return serializeCarrierSettings(row);
    },
    [`shipping-settings-${storeId}`],
    {
      tags: [
        SHIPPING_SETTINGS_CACHE_TAG,
        `${SHIPPING_SETTINGS_CACHE_TAG}:${storeId}`,
        STORE_CACHE_TAG,
      ],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  return cached();
}

export async function isCarrierShippingEnabled(storeId: string): Promise<boolean> {
  const settings = await getStoreShippingSettings(storeId);
  return settings.carriersEnabled;
}
