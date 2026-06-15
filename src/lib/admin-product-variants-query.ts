import type { VariantRow } from "@/components/admin/variant-manager";
import { db } from "@/lib/db";

export async function getAdminProductVariants(
  storeId: string,
  productId: string,
): Promise<VariantRow[]> {
  const product = await db.product.findFirst({
    where: { id: productId, storeId },
    select: {
      variants: {
        orderBy: [{ size: "asc" }, { color: "asc" }],
        include: { _count: { select: { orderItems: true } } },
      },
    },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  return product.variants.map((variant) => ({
    id: variant.id,
    size: variant.size,
    color: variant.color,
    sku: variant.sku,
    stock: variant.stock,
    price: Number(variant.price),
    imageUrl: variant.imageUrl,
    orderItemCount: variant._count.orderItems,
  }));
}
