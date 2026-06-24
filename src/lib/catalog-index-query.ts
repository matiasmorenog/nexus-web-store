import { revalidateTag, unstable_cache } from "next/cache";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import type { CatalogIndexData, CatalogIndexProduct } from "@/lib/catalog-index";

export const CATALOG_INDEX_CACHE_TAG = "catalog-index";

const productInclude = {
  variants: {
    orderBy: { price: "asc" as const },
    select: {
      size: true,
      color: true,
      sku: true,
      stock: true,
      price: true,
      imageUrl: true,
    },
  },
} as const;

function mapProductToIndex(product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  featured: boolean;
  promo2x1: boolean;
  createdAt: Date;
  variants: {
    size: string;
    color: string;
    sku: string;
    stock: number;
    price: unknown;
    imageUrl: string;
  }[];
}): CatalogIndexProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    audience: product.audience,
    featured: product.featured,
    promo2x1: product.promo2x1,
    createdAt: product.createdAt.toISOString(),
    variants: product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      stock: variant.stock,
      price: Number(variant.price),
      imageUrl: variant.imageUrl,
    })),
  };
}

const getCachedCatalogIndex = (storeId: string) =>
  unstable_cache(
    async (): Promise<CatalogIndexData> => {
      const products = await db.product.findMany({
        where: { storeId },
        include: productInclude,
        orderBy: { createdAt: "desc" },
      });

      return {
        products: products.map(mapProductToIndex),
      };
    },
    ["catalog-index", storeId],
    {
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_INDEX_CACHE_TAG],
    },
  );

export async function getCatalogIndex(storeId: string) {
  return getCachedCatalogIndex(storeId)();
}

export function revalidateCatalogIndexCache() {
  revalidateTag(CATALOG_INDEX_CACHE_TAG, { expire: 0 });
}
