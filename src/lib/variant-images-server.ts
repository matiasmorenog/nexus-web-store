import "server-only";

import { db } from "@/lib/db";

export async function findProductColorImage(
  productId: string,
  color: string,
) {
  const variant = await db.productVariant.findFirst({
    where: {
      productId,
      color: { equals: color.trim(), mode: "insensitive" },
    },
    select: { imageUrl: true },
    orderBy: { createdAt: "asc" },
  });

  return variant?.imageUrl ?? null;
}

export async function syncProductColorImage(
  productId: string,
  color: string,
  imageUrl: string,
) {
  await db.productVariant.updateMany({
    where: {
      productId,
      color: { equals: color.trim(), mode: "insensitive" },
    },
    data: { imageUrl },
  });
}
