import { revalidateTag, unstable_cache } from "next/cache";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { getProductCardImages, partitionVariantsForCard } from "@/lib/variant-images";

export const STOREFRONT_PRODUCTS_CACHE_TAG = "storefront-products";

export type StorefrontProductCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  audience: string;
  promo2x1: boolean;
  featured: boolean;
  imageUrl: string;
  hoverImageUrl?: string;
  price: number;
  inStock: boolean;
};

type GetStorefrontProductsOptions = {
  featuredOnly?: boolean;
  limit?: number;
};

const getCachedStorefrontProducts = (
  storeId: string,
  featuredOnly: boolean,
  limit: number,
) =>
  unstable_cache(
    async (): Promise<StorefrontProductCard[]> => {
      const products = await db.product.findMany({
        where: {
          storeId,
          ...(featuredOnly ? { featured: true } : {}),
        },
        include: {
          variants: {
            orderBy: { price: "asc" },
            select: { color: true, imageUrl: true, price: true, stock: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return products.map((product) => {
        const { inStock, displayVariants } = partitionVariantsForCard(
          product.variants,
        );
        const cardImages = getProductCardImages(displayVariants);

        return {
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          audience: product.audience,
          promo2x1: product.promo2x1,
          featured: product.featured,
          imageUrl: cardImages.imageUrl,
          hoverImageUrl: cardImages.hoverImageUrl,
          price: cardImages.price,
          inStock,
        };
      });
    },
    ["storefront-products", storeId, featuredOnly ? "featured" : "all", String(limit)],
    {
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
      tags: [STOREFRONT_PRODUCTS_CACHE_TAG],
    },
  );

export async function getStorefrontProducts(
  storeId: string,
  options: GetStorefrontProductsOptions = {},
) {
  const featuredOnly = options.featuredOnly ?? false;
  const limit = options.limit ?? (featuredOnly ? 8 : 48);
  return getCachedStorefrontProducts(storeId, featuredOnly, limit)();
}

export function revalidateStorefrontProductsCache() {
  revalidateTag(STOREFRONT_PRODUCTS_CACHE_TAG, { expire: 0 });
}
