import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const STOREFRONT_PRODUCT_REVALIDATE_SECONDS = 60;

const productInclude = {
  variants: {
    orderBy: [{ color: "asc" as const }, { size: "asc" as const }],
  },
};

export type StorefrontProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

const getCachedStorefrontProduct = unstable_cache(
  async (storeId: string, slug: string): Promise<StorefrontProduct | null> =>
    db.product.findFirst({
      where: { storeId, slug },
      include: productInclude,
    }),
  ["storefront-product"],
  { revalidate: STOREFRONT_PRODUCT_REVALIDATE_SECONDS },
);

export async function getStorefrontProduct(storeId: string, slug: string) {
  return getCachedStorefrontProduct(storeId, slug);
}

export async function getStorefrontProductSlugs(storeId: string) {
  return db.product.findMany({
    where: { storeId },
    select: { slug: true },
  });
}
