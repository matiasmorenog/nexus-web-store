import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getProductCardImages, partitionVariantsForCard } from "@/lib/variant-images";

export const FEATURED_PRODUCTS_CACHE_TAG = "featured-products";

const FEATURED_PRODUCTS_REVALIDATE_SECONDS = 60;

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

const getCachedFeaturedProducts = unstable_cache(
  async (storeId: string): Promise<FeaturedProductCard[]> => {
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
  ["featured-products"],
  {
    revalidate: FEATURED_PRODUCTS_REVALIDATE_SECONDS,
    tags: [FEATURED_PRODUCTS_CACHE_TAG],
  },
);

export async function getFeaturedProducts(storeId: string) {
  return getCachedFeaturedProducts(storeId);
}

export function revalidateFeaturedProductsCache() {
  revalidateTag(FEATURED_PRODUCTS_CACHE_TAG, { expire: 0 });
}
