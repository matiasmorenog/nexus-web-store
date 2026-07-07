import { revalidatePath, revalidateTag } from "next/cache";
import { validateThemeSettingsForVertical } from "@/lib/premium-themes/resolve";
import { THEME_SETTINGS_CACHE_TAG } from "@/lib/premium-themes/query";
import type { StoreThemeSettingsData } from "@/lib/premium-themes/types";
import { getStorefrontKind } from "@/lib/store-verticals";
import { db } from "@/lib/db";

export async function saveStoreThemeSettings(
  storeId: string,
  input: StoreThemeSettingsData,
): Promise<void> {
  const vertical = getStorefrontKind();
  const settings = validateThemeSettingsForVertical(vertical, input);

  await db.storeThemeSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      themeId: settings.themeId,
      allowCustomerThemeToggle: settings.allowCustomerThemeToggle,
    },
    update: {
      themeId: settings.themeId,
      allowCustomerThemeToggle: settings.allowCustomerThemeToggle,
    },
  });

  revalidateTag(THEME_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(`${THEME_SETTINGS_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidatePath("/");
}
