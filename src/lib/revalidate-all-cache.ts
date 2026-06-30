import { revalidatePath, revalidateTag } from "next/cache";
import {
  adminDashboardCacheTag,
  adminProductsSummaryCacheTag,
} from "@/lib/admin-cache-tags";
import { revalidateCatalogIndexCache } from "@/lib/catalog-index-query";
import { revalidateFeaturedProductsCache } from "@/lib/featured-products-query";
import { INFO_PAGE_SLUGS } from "@/lib/info-pages";
import { STORE_CACHE_TAG } from "@/lib/store-context";
import { revalidateStorefrontProductsCache } from "@/lib/storefront-products-query";

/** Invalida tags y paths de storefront + admin para una tienda. */
export function revalidateAllStoreCache(
  storeId: string,
  productSlugs: string[] = [],
) {
  revalidateTag(STORE_CACHE_TAG, { expire: 0 });
  revalidateTag(adminDashboardCacheTag(storeId), { expire: 0 });
  revalidateTag(adminProductsSummaryCacheTag(storeId), { expire: 0 });
  revalidateCatalogIndexCache();
  revalidateFeaturedProductsCache();
  revalidateStorefrontProductsCache();

  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/checkout");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/configuracion");

  for (const slug of INFO_PAGE_SLUGS) {
    revalidatePath(`/${slug}`);
  }

  for (const slug of new Set(productSlugs)) {
    revalidatePath(`/producto/${slug}`);
  }
}
