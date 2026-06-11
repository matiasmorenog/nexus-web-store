import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminProductsSection } from "@/components/admin/admin-products-section";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const products = await db.product.findMany({
    where: { storeId },
    include: {
      variants: { orderBy: { price: "asc" }, take: 1 },
      _count: { select: { variants: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    featured: product.featured,
    variants: product.variants.map((v) => ({
      imageUrl: v.imageUrl,
      price: Number(v.price),
    })),
    _count: product._count,
  }));

  return <AdminProductsSection products={rows} />;
}
