import { revalidatePath, revalidateTag } from "next/cache";
import { STORE_CATEGORIES_CACHE_TAG } from "@/lib/store-categories/query";
import { revalidateAdminProductDataCaches } from "@/lib/revalidate-admin-cache";
import { revalidateCatalogIndexCache } from "@/lib/catalog-index-query";
import { revalidateFeaturedProductsCache } from "@/lib/featured-products-query";
import { revalidateStorefrontProductsCache } from "@/lib/storefront-products-query";

export function revalidateStoreCategoriesCache(storeId: string) {
  revalidateTag(STORE_CATEGORIES_CACHE_TAG, { expire: 0 });
  revalidateTag(`${STORE_CATEGORIES_CACHE_TAG}:${storeId}`, { expire: 0 });
}

/** Tras CRUD de categorías: storefront + admin productos. */
export function revalidateAfterStoreCategoryChange(storeId: string) {
  revalidateStoreCategoriesCache(storeId);
  revalidateCatalogIndexCache();
  revalidateFeaturedProductsCache();
  revalidateStorefrontProductsCache();
  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/");
  revalidatePath("/productos");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}
