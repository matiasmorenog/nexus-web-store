import { unstable_cache } from "next/cache";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";
import type {
  ResolvedStoreSeoSettings,
  StoreSeoSettingsData,
} from "@/lib/seo/types";

export const SEO_SETTINGS_CACHE_TAG = "seo-settings";

const DEFAULT_SETTINGS: StoreSeoSettingsData = {
  metaDescription: "",
  ogImageUrl: "",
  robotsIndex: true,
  structuredDataEnabled: true,
};

function mapRow(
  row: {
    metaDescription: string | null;
    ogImageUrl: string | null;
    robotsIndex: boolean;
    structuredDataEnabled: boolean;
  } | null,
): StoreSeoSettingsData {
  return {
    metaDescription: row?.metaDescription?.trim() ?? "",
    ogImageUrl: row?.ogImageUrl?.trim() ?? "",
    robotsIndex: row?.robotsIndex ?? true,
    structuredDataEnabled: row?.structuredDataEnabled ?? true,
  };
}

async function loadSeoSettingsRow(storeId: string) {
  return db.storeSeoSettings.findUnique({
    where: { storeId },
  });
}

export async function getStoreSeoSettingsForAdmin(
  storeId: string,
): Promise<StoreSeoSettingsData> {
  const row = await loadSeoSettingsRow(storeId);
  return mapRow(row);
}

export async function getResolvedStoreSeoSettings(
  storeId: string,
): Promise<ResolvedStoreSeoSettings | null> {
  const enabled = await storeHasModule(storeId, "seo");
  if (!enabled) {
    return null;
  }

  const cached = unstable_cache(
    async () => {
      const row = await loadSeoSettingsRow(storeId);
      return {
        enabled: true as const,
        ...mapRow(row),
      };
    },
    [`seo-settings-${storeId}`],
    {
      tags: [SEO_SETTINGS_CACHE_TAG, `${SEO_SETTINGS_CACHE_TAG}:${storeId}`],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  return cached();
}
