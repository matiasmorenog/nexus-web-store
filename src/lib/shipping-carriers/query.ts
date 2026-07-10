import { unstable_cache } from "next/cache";
import type { StoreShippingSettings } from "@prisma/client";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";
import { isMercadoEnviosCarrierId } from "@/lib/shipping-carriers/format";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type StoreShippingSettingsData,
} from "@/lib/shipping-carriers/types";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export const SHIPPING_SETTINGS_CACHE_TAG = "shipping-settings";

function serializeSettings(
  row: StoreShippingSettings | null,
): StoreShippingSettingsData {
  if (!row) return DEFAULT_SHIPPING_SETTINGS;

  return {
    carriersEnabled: row.carriersEnabled,
    preferredCarrierId: isMercadoEnviosCarrierId(row.preferredCarrierId)
      ? row.preferredCarrierId
      : DEFAULT_SHIPPING_SETTINGS.preferredCarrierId,
  };
}

export async function getStoreShippingSettingsForAdmin(
  storeId: string,
): Promise<StoreShippingSettingsData> {
  const row = await db.storeShippingSettings.findUnique({
    where: { storeId },
  });
  return serializeSettings(row);
}

export async function getStoreShippingSettings(
  storeId: string,
): Promise<StoreShippingSettingsData> {
  if (!(await storeHasModule(storeId, "shippingCarriers"))) {
    return { ...DEFAULT_SHIPPING_SETTINGS, carriersEnabled: false };
  }

  const cached = unstable_cache(
    async () => {
      const row = await db.storeShippingSettings.findUnique({
        where: { storeId },
      });
      return serializeSettings(row);
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
