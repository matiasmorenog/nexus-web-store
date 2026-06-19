import type { AdminProductRow } from "@/components/admin/admin-products-section";
import { db } from "@/lib/db";
import { ADMIN_LIST_PAGE_SIZE, adminListSkip } from "@/lib/admin-pagination";

type ProductWithRelations = Awaited<
  ReturnType<typeof fetchAdminProductsBatch>
>[number];

async function fetchAdminProductsBatch(storeId: string, page: number) {
  return db.product.findMany({
    where: { storeId },
    include: {
      variants: { orderBy: { price: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: adminListSkip(page),
    take: ADMIN_LIST_PAGE_SIZE,
  });
}

export function mapAdminProductRow(product: ProductWithRelations): AdminProductRow {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    audience: product.audience,
    featured: product.featured,
    variants: product.variants.map((variant) => ({
      imageUrl: variant.imageUrl,
      price: Number(variant.price),
    })),
    _count: product._count,
  };
}

export async function getAdminProductsPage(storeId: string, page = 1) {
  const where = { storeId };

  const [products, total] = await Promise.all([
    fetchAdminProductsBatch(storeId, page),
    db.product.count({ where }),
  ]);

  const rows = products.map(mapAdminProductRow);

  return {
    products: rows,
    total,
    page,
    hasMore: adminListSkip(page) + rows.length < total,
  };
}
