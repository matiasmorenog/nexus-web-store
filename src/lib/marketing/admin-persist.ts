import { revalidatePath, revalidateTag } from "next/cache";
import {
  isValidMetaPixelId,
  isValidWhatsAppPhone,
  normalizeMetaPixelId,
  normalizeWhatsAppPhone,
} from "@/lib/marketing/format";
import { MARKETING_SETTINGS_CACHE_TAG } from "@/lib/marketing/query";
import type { StoreMarketingSettingsData } from "@/lib/marketing/types";
import { db } from "@/lib/db";

export async function saveStoreMarketingSettings(
  storeId: string,
  input: StoreMarketingSettingsData,
): Promise<void> {
  const whatsappEnabled = input.whatsappEnabled;
  const metaPixelEnabled = input.metaPixelEnabled;

  let whatsappPhone: string | null = null;
  const whatsappMessage = input.whatsappMessage?.trim() || null;
  let metaPixelId: string | null = null;

  if (whatsappEnabled) {
    const phone = normalizeWhatsAppPhone(input.whatsappPhone ?? "");
    if (!isValidWhatsAppPhone(phone)) {
      throw new Error("Ingresá un número de WhatsApp válido (10–15 dígitos).");
    }
    whatsappPhone = phone;
  }

  if (metaPixelEnabled) {
    const pixelId = normalizeMetaPixelId(input.metaPixelId ?? "");
    if (!isValidMetaPixelId(pixelId)) {
      throw new Error("El ID del Meta Pixel debe ser numérico (8–20 dígitos).");
    }
    metaPixelId = pixelId;
  }

  await db.storeMarketingSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      whatsappEnabled,
      whatsappPhone,
      whatsappMessage,
      metaPixelEnabled,
      metaPixelId,
    },
    update: {
      whatsappEnabled,
      whatsappPhone,
      whatsappMessage,
      metaPixelEnabled,
      metaPixelId,
    },
  });

  revalidateTag(MARKETING_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(`${MARKETING_SETTINGS_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/checkout/exito");
}
