import { unstable_cache } from "next/cache";
import type { StoreThemeSettings } from "@prisma/client";
import {
  getDefaultThemeIdForVertical,
  normalizeThemeIdForVertical,
} from "@/lib/premium-themes/resolve";
import {
  DEFAULT_THEME_SETTINGS,
  type ResolvedStoreTheme,
  type StoreThemeSettingsData,
} from "@/lib/premium-themes/types";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { storeHasModule } from "@/lib/modules";
import { STORE_CACHE_TAG } from "@/lib/store-context";
import { getStorefrontKind } from "@/lib/store-verticals";
import { db } from "@/lib/db";

export const THEME_SETTINGS_CACHE_TAG = "theme-settings";

function serializeSettings(
  row: StoreThemeSettings | null,
): StoreThemeSettingsData {
  if (!row) return DEFAULT_THEME_SETTINGS;

  return {
    themeId: row.themeId,
    allowCustomerThemeToggle: row.allowCustomerThemeToggle,
  };
}

export async function getStoreThemeSettingsForAdmin(
  storeId: string,
): Promise<StoreThemeSettingsData> {
  const row = await db.storeThemeSettings.findUnique({
    where: { storeId },
  });
  const vertical = getStorefrontKind();
  const settings = serializeSettings(row);
  return {
    themeId: normalizeThemeIdForVertical(vertical, settings.themeId),
    allowCustomerThemeToggle: settings.allowCustomerThemeToggle,
  };
}

export async function getResolvedStoreTheme(
  storeId: string,
): Promise<ResolvedStoreTheme> {
  const moduleActive = await storeHasModule(storeId, "premiumThemes");
  const vertical = getStorefrontKind();
  const fallbackThemeId = getDefaultThemeIdForVertical(vertical);

  if (!moduleActive) {
    return {
      themeId: fallbackThemeId,
      allowCustomerThemeToggle: true,
      moduleActive: false,
    };
  }

  const cached = unstable_cache(
    async () => {
      const row = await db.storeThemeSettings.findUnique({
        where: { storeId },
      });
      return serializeSettings(row);
    },
    [`theme-settings-${storeId}`],
    {
      tags: [
        THEME_SETTINGS_CACHE_TAG,
        `${THEME_SETTINGS_CACHE_TAG}:${storeId}`,
        STORE_CACHE_TAG,
      ],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  const settings = await cached();
  return {
    themeId: normalizeThemeIdForVertical(vertical, settings.themeId),
    allowCustomerThemeToggle: settings.allowCustomerThemeToggle,
    moduleActive: true,
  };
}
