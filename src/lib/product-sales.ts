import { db } from "@/lib/db";

const COUNTED_ORDER_STATUSES = ["PAID", "SHIPPED"] as const;

export async function getProductSalesTotals(storeId: string) {
  const rows = await db.orderItem.groupBy({
    by: ["variantId"],
    where: {
      order: {
        storeId,
        status: { in: [...COUNTED_ORDER_STATUSES] },
      },
    },
    _sum: { quantity: true },
  });

  if (rows.length === 0) {
    return new Map<string, number>();
  }

  const variants = await db.productVariant.findMany({
    where: { id: { in: rows.map((row) => row.variantId) } },
    select: { id: true, productId: true },
  });

  const productIdByVariant = new Map(
    variants.map((variant) => [variant.id, variant.productId]),
  );

  const totals = new Map<string, number>();

  for (const row of rows) {
    const productId = productIdByVariant.get(row.variantId);
    if (!productId) continue;

    totals.set(
      productId,
      (totals.get(productId) ?? 0) + (row._sum.quantity ?? 0),
    );
  }

  return totals;
}
