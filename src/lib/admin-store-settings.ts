import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { normalizeBrandPrefix } from "@/lib/brand";

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

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
}
