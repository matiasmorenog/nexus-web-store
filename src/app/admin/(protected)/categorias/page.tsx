import { AdminCategoryCreateForm } from "@/components/admin/admin-category-create-form";
import { AdminCategoriesList } from "@/components/admin/admin-categories-list";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminPermission } from "@/lib/admin-session";
import { db } from "@/lib/db";
import {
  getStoreCategoriesForAdmin,
  serializeStoreCategory,
} from "@/lib/store-categories";
import { ensureStoreCategoriesSeeded } from "@/lib/store-categories/seed";
import { getStorefrontConfig } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await requireAdminPermission("products:manage");
  const storeId = session.user.storeId;

  await ensureStoreCategoriesSeeded(
    db,
    storeId,
    getStorefrontConfig().productCategories,
  );

  const categories = await getStoreCategoriesForAdmin(storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Categorías"
          description="Definí las categorías del catálogo de esta tienda. Los productos usan el slug como texto (sin FK)."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <div className="max-w-3xl">
          <AdminCategoryCreateForm />
        </div>
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminCategoriesList categories={categories.map(serializeStoreCategory)} />
      </AdminDashboardReveal>
    </div>
  );
}
