import { db } from "@/lib/db";

export async function addWishlistItem(
  storeId: string,
  userId: string,
  productId: string,
): Promise<void> {
  const product = await db.product.findFirst({
    where: { id: productId, storeId },
    select: { id: true },
  });

  if (!product) {
    throw new Error("Producto no encontrado.");
  }

  await db.wishlistItem.upsert({
    where: {
      storeId_userId_productId: { storeId, userId, productId },
    },
    create: { storeId, userId, productId },
    update: {},
  });
}

export async function removeWishlistItem(
  storeId: string,
  userId: string,
  productId: string,
): Promise<void> {
  await db.wishlistItem.deleteMany({
    where: { storeId, userId, productId },
  });
}

export async function syncCustomerWishlist(
  storeId: string,
  userId: string,
  productIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))];
  if (uniqueIds.length === 0) return;

  const validProducts = await db.product.findMany({
    where: { storeId, id: { in: uniqueIds } },
    select: { id: true },
  });

  await db.$transaction(
    validProducts.map((product) =>
      db.wishlistItem.upsert({
        where: {
          storeId_userId_productId: {
            storeId,
            userId,
            productId: product.id,
          },
        },
        create: {
          storeId,
          userId,
          productId: product.id,
        },
        update: {},
      }),
    ),
  );
}
