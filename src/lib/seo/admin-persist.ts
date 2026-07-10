import { revalidatePath, revalidateTag } from "next/cache";
import {
  isValidOgImageUrl,
  normalizeMetaDescription,
  normalizeOgImageUrl,
} from "@/lib/seo/format";
import { SEO_SETTINGS_CACHE_TAG } from "@/lib/seo/query";
import type { StoreSeoSettingsData } from "@/lib/seo/types";
import { db } from "@/lib/db";

export async function saveStoreSeoSettings(
  storeId: string,
  input: StoreSeoSettingsData,
): Promise<void> {
  const metaDescription = normalizeMetaDescription(input.metaDescription);
  const ogImageUrl = normalizeOgImageUrl(input.ogImageUrl);

  if (!isValidOgImageUrl(ogImageUrl)) {
    throw new Error("La URL de imagen Open Graph debe ser http o https.");
  }

  await db.storeSeoSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      metaDescription: metaDescription || null,
      ogImageUrl: ogImageUrl || null,
      robotsIndex: input.robotsIndex,
      structuredDataEnabled: input.structuredDataEnabled,
    },
    update: {
      metaDescription: metaDescription || null,
      ogImageUrl: ogImageUrl || null,
      robotsIndex: input.robotsIndex,
      structuredDataEnabled: input.structuredDataEnabled,
    },
  });

  revalidateTag(SEO_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(`${SEO_SETTINGS_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}
