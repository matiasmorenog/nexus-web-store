import { revalidatePath, revalidateTag } from "next/cache";
import {
  applyHomeEditorCapabilities,
  getHomeEditorCapabilities,
} from "@/lib/home-content/capabilities";
import { HOME_CONTENT_CACHE_TAG } from "@/lib/home-content/query";
import { homeContentPayloadSchema } from "@/lib/home-content/types";
import { db } from "@/lib/db";
import {
  getEnabledModulesForStore,
  resolvePlanTier,
} from "@/lib/modules";
import { formatStoreName, getStore } from "@/lib/store-context";
import { getStorefrontKind } from "@/lib/store-verticals";

export async function saveStoreHomeContent(storeId: string, payload: unknown) {
  const parsed = homeContentPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Contenido de home inválido";
    throw new Error(message);
  }

  const enabled = await getEnabledModulesForStore(storeId);
  const tier = resolvePlanTier([...enabled]);
  const capabilities = getHomeEditorCapabilities(tier.id);
  const store = await getStore();
  const vertical = getStorefrontKind();
  const normalized = applyHomeEditorCapabilities(
    parsed.data,
    capabilities,
    vertical,
    formatStoreName(store.name),
  );

  await db.storeHomeContent.upsert({
    where: { storeId },
    create: {
      storeId,
      version: normalized.version,
      payload: normalized,
    },
    update: {
      version: normalized.version,
      payload: normalized,
    },
  });

  revalidateTag(HOME_CONTENT_CACHE_TAG, { expire: 0 });
  revalidateTag(`${HOME_CONTENT_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidatePath("/");
}
