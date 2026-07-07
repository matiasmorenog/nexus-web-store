import { revalidatePath, revalidateTag } from "next/cache";
import { normalizePreferredCarrierId } from "@/lib/shipping-carriers/format";
import { SHIPPING_SETTINGS_CACHE_TAG } from "@/lib/shipping-carriers/query";
import type { StoreShippingSettingsData } from "@/lib/shipping-carriers/types";
import { db } from "@/lib/db";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export async function saveStoreShippingSettings(
  storeId: string,
  input: StoreShippingSettingsData,
): Promise<void> {
  const preferredCarrierId = normalizePreferredCarrierId(
    input.preferredCarrierId,
  );

  if (!preferredCarrierId) {
    throw new Error("Seleccioná un operador logístico válido.");
  }

  await db.storeShippingSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      carriersEnabled: input.carriersEnabled,
      preferredCarrierId,
    },
    update: {
      carriersEnabled: input.carriersEnabled,
      preferredCarrierId,
    },
  });

  revalidateTag(SHIPPING_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(`${SHIPPING_SETTINGS_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidateTag(STORE_CACHE_TAG, { expire: 0 });
  revalidatePath("/checkout");
}
