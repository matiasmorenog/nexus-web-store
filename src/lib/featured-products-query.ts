import { revalidateTag, unstable_cache } from "next/cache";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { getProductCardImages, partitionVariantsForCard } from "@/lib/variant-images";

export const FEATURED_PRODUCTS_CACHE_TAG = "featured-products";

export type FeaturedProductCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  audience: string;
  promo2x1: boolean;
  imageUrl: string;
  hoverImageUrl?: string;
  price: number;
  inStock: boolean;
};

const getCachedFeaturedProducts = (storeId: string) =>
  unstable_cache(
    async (): Promise<FeaturedProductCard[]> => {
      const featuredProducts = await db.product.findMany({
        where: { storeId, featured: true },
        include: {
          variants: {
            orderBy: { price: "asc" },
            select: { color: true, imageUrl: true, price: true, stock: true },
          },
        },
        take: 8,
      });

      return featuredProducts.map((product) => {
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
          imageUrl: cardImages.imageUrl,
          hoverImageUrl: cardImages.hoverImageUrl,
          price: cardImages.price,
          inStock,
        };
      });
    },
    ["featured-products", storeId],
    {
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
      tags: [FEATURED_PRODUCTS_CACHE_TAG],
    },
  );

export async function getFeaturedProducts(storeId: string) {
  return getCachedFeaturedProducts(storeId)();
}

export function revalidateFeaturedProductsCache() {
  revalidateTag(FEATURED_PRODUCTS_CACHE_TAG, { expire: 0 });
}
