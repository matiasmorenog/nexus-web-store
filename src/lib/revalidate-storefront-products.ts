import { revalidatePath } from "next/cache";
import { revalidateCatalogIndexCache } from "@/lib/catalog-index-query";
import { revalidateFeaturedProductsCache } from "@/lib/featured-products-query";
import { revalidateStorefrontProductsCache } from "@/lib/storefront-products-query";

function revalidateStorefrontListingSurfaces() {
  revalidateCatalogIndexCache();
  revalidateFeaturedProductsCache();
  revalidateStorefrontProductsCache();
  revalidatePath("/");
  revalidatePath("/productos");
}

export function revalidateStorefrontProductSurfaces(slug: string) {
  revalidateStorefrontListingSurfaces();
  revalidatePath(`/producto/${slug}`);
}

/** Tras venta: stock en catálogo, home y PDPs de los productos del pedido. */
export function revalidateStorefrontStockSurfaces(productSlugs: string[]) {
  revalidateStorefrontListingSurfaces();
  for (const slug of new Set(productSlugs)) {
    revalidatePath(`/producto/${slug}`);
  }
}
