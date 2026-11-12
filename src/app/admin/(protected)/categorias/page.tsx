import { AdminCategoryCreateForm } from "@/components/admin/admin-category-create-form";
import { AdminCategoriesList } from "@/components/admin/admin-categories-list";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
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
        <div className="max-w-3xl">
          <AdminCategoryCreateForm />
        </div>
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminCategoriesList categories={categories.map(serializeStoreCategory)} />
      </AdminDashboardReveal>
    </div>
  );
}
