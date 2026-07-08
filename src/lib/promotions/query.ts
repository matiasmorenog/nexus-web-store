import { unstable_cache } from "next/cache";
import type { StorePromotionSettings } from "@prisma/client";
import {
  DEFAULT_PROMOTION_SETTINGS,
  type StorePromotionSettingsData,
} from "@/lib/promotions/types";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { storeHasModule } from "@/lib/modules";
import { STORE_CACHE_TAG } from "@/lib/store-context";
import { db } from "@/lib/db";

export const PROMOTION_SETTINGS_CACHE_TAG = "promotion-settings";

function serializeSettings(
  row: StorePromotionSettings | null,
): StorePromotionSettingsData {
  if (!row) return DEFAULT_PROMOTION_SETTINGS;

  return {
    promo2x1Enabled: row.promo2x1Enabled,
  };
}

export async function getStorePromotionSettingsForAdmin(
  storeId: string,
): Promise<StorePromotionSettingsData> {
  const row = await db.storePromotionSettings.findUnique({
    where: { storeId },
  });
  return serializeSettings(row);
}

/** 2x1 activo = módulo `coupons` activo Y toggle encendido en admin. */
export async function isPromo2x1ActiveForStore(
  storeId: string,
): Promise<boolean> {
  if (!(await storeHasModule(storeId, "coupons"))) {
    return false;
  }

  const cached = unstable_cache(
    async () => {
      const row = await db.storePromotionSettings.findUnique({
        where: { storeId },
      });
      return serializeSettings(row);
    },
    [`promotion-settings-${storeId}`],
    {
      tags: [
        PROMOTION_SETTINGS_CACHE_TAG,
        `${PROMOTION_SETTINGS_CACHE_TAG}:${storeId}`,
        STORE_CACHE_TAG,
      ],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  const settings = await cached();
  return settings.promo2x1Enabled;
}
