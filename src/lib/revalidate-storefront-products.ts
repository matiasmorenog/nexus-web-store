import { revalidatePath } from "next/cache";
import { revalidateCatalogIndexCache } from "@/lib/catalog-index-query";
import { revalidateFeaturedProductsCache } from "@/lib/featured-products-query";

export function revalidateStorefrontProductSurfaces(slug: string) {
  revalidateCatalogIndexCache();
  revalidateFeaturedProductsCache();
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath(`/producto/${slug}`);
}
