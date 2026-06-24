import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { normalizeBrandPrefix } from "@/lib/brand";
import { INFO_PAGE_SLUGS } from "@/lib/info-pages";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export async function saveStoreSettingsFromForm(
  storeId: string,
  formData: FormData,
) {
  await db.store.update({
    where: { id: storeId },
    data: {
      name: normalizeBrandPrefix(String(formData.get("name") ?? "")),
      shippingFlatRate:
        parseFloat(String(formData.get("shippingFlatRate") ?? "")) || 0,
      allowPickup: formData.get("allowPickup") === "on",
    },
  });

  revalidateTag(STORE_CACHE_TAG, { expire: 0 });
  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  revalidatePath("/checkout");
  for (const slug of INFO_PAGE_SLUGS) {
    revalidatePath(`/${slug}`);
  }
}
