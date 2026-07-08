import { revalidatePath, revalidateTag } from "next/cache";
import { PROMOTION_SETTINGS_CACHE_TAG } from "@/lib/promotions/query";
import type { StorePromotionSettingsData } from "@/lib/promotions/types";
import { db } from "@/lib/db";

export async function saveStorePromotionSettings(
  storeId: string,
  input: StorePromotionSettingsData,
): Promise<void> {
  const promo2x1Enabled = Boolean(input.promo2x1Enabled);

  await db.storePromotionSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      promo2x1Enabled,
    },
    update: {
      promo2x1Enabled,
    },
  });

  revalidateTag(PROMOTION_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(`${PROMOTION_SETTINGS_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/checkout");
}
