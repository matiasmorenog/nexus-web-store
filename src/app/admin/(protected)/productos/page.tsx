import { auth } from "@/lib/auth";
import { getAdminProductsPage } from "@/lib/admin-products-query";
import { AdminProductsSection } from "@/components/admin/admin-products-section";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const { products, total, hasMore } = await getAdminProductsPage(storeId);

  return (
    <AdminProductsSection
      initialProducts={products}
      total={total}
      hasMore={hasMore}
    />
  );
}
