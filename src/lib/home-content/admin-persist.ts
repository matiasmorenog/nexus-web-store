import { revalidatePath, revalidateTag } from "next/cache";
import { HOME_CONTENT_CACHE_TAG } from "@/lib/home-content/query";
import { homeContentPayloadSchema } from "@/lib/home-content/types";
import { db } from "@/lib/db";

export async function saveStoreHomeContent(storeId: string, payload: unknown) {
  const parsed = homeContentPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Contenido de home inválido";
    throw new Error(message);
  }

  await db.storeHomeContent.upsert({
    where: { storeId },
    create: {
      storeId,
      version: parsed.data.version,
      payload: parsed.data,
    },
    update: {
      version: parsed.data.version,
      payload: parsed.data,
    },
  });

  revalidateTag(HOME_CONTENT_CACHE_TAG, { expire: 0 });
  revalidateTag(`${HOME_CONTENT_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidatePath("/");
}
