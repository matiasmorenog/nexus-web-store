import { db } from "@/lib/db";
import type {
  WishlistAdminInsights,
  WishlistProductSnapshot,
} from "@/lib/wishlist/types";

function decimalToNumber(value: { toString(): string }): number {
  return Number(value.toString());
}

function mapWishlistProduct(
  item: {
    productId: string;
    createdAt: Date;
    product: {
      name: string;
      slug: string;
      variants: { price: { toString(): string }; imageUrl: string }[];
    };
  },
): WishlistProductSnapshot {
  const prices = item.product.variants.map((variant) =>
    decimalToNumber(variant.price),
  );
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const imageUrl = item.product.variants.find((variant) => variant.imageUrl)?.imageUrl ?? "";

  return {
    productId: item.productId,
    productSlug: item.product.slug,
    productName: item.product.name,
    imageUrl,
    minPrice,
    addedAt: item.createdAt.toISOString(),
  };
}

export async function listCustomerWishlist(
  storeId: string,
  userId: string,
): Promise<WishlistProductSnapshot[]> {
  const items = await db.wishlistItem.findMany({
    where: { storeId, userId },
    orderBy: { createdAt: "desc" },
    select: {
      productId: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          slug: true,
          variants: {
            select: { price: true, imageUrl: true },
            orderBy: { price: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  return items.map(mapWishlistProduct);
}

export async function getWishlistAdminInsights(
  storeId: string,
): Promise<WishlistAdminInsights> {
  const [totalItems, uniqueCustomers, grouped] = await Promise.all([
    db.wishlistItem.count({ where: { storeId } }),
    db.wishlistItem.groupBy({
      by: ["userId"],
      where: { storeId },
    }),
    db.wishlistItem.groupBy({
      by: ["productId"],
      where: { storeId },
      _count: { _all: true },
      orderBy: { _count: { productId: "desc" } },
      take: 10,
    }),
  ]);

  const productIds = grouped.map((group) => group.productId);
  const products =
    productIds.length > 0
      ? await db.product.findMany({
          where: { storeId, id: { in: productIds } },
          select: { id: true, name: true, slug: true },
        })
      : [];
  const productMap = new Map(products.map((product) => [product.id, product]));

  return {
    totalItems,
    uniqueCustomers: uniqueCustomers.length,
    topProducts: grouped
      .map((group) => {
        const product = productMap.get(group.productId);
        if (!product) return null;
        return {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          wishlistCount: group._count._all,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item != null),
  };
}
