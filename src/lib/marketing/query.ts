import { unstable_cache } from "next/cache";
import type { StoreMarketingSettings } from "@prisma/client";
import {
  DEFAULT_MARKETING_SETTINGS,
  type StoreMarketingSettingsData,
} from "@/lib/marketing/types";
import { STORE_CACHE_TAG } from "@/lib/store-context";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";

export const MARKETING_SETTINGS_CACHE_TAG = "marketing-settings";

function serializeSettings(
  row: StoreMarketingSettings | null,
): StoreMarketingSettingsData {
  if (!row) return DEFAULT_MARKETING_SETTINGS;

  return {
    whatsappEnabled: row.whatsappEnabled,
    whatsappPhone: row.whatsappPhone,
    whatsappMessage: row.whatsappMessage,
    metaPixelEnabled: row.metaPixelEnabled,
    metaPixelId: row.metaPixelId,
  };
}

export async function getStoreMarketingSettings(
  storeId: string,
): Promise<StoreMarketingSettingsData> {
  if (!(await storeHasModule(storeId, "marketing"))) {
    return DEFAULT_MARKETING_SETTINGS;
  }

  const cached = unstable_cache(
    async () => {
      const row = await db.storeMarketingSettings.findUnique({
        where: { storeId },
      });
      return serializeSettings(row);
    },
    [`marketing-settings-${storeId}`],
    {
      tags: [
        MARKETING_SETTINGS_CACHE_TAG,
        `${MARKETING_SETTINGS_CACHE_TAG}:${storeId}`,
        STORE_CACHE_TAG,
      ],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  return cached();
}

export async function getStoreMarketingSettingsForAdmin(
  storeId: string,
): Promise<StoreMarketingSettingsData> {
  const row = await db.storeMarketingSettings.findUnique({
    where: { storeId },
  });
  return serializeSettings(row);
}
