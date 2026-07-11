import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminWishlistInsights } from "@/components/admin/admin-wishlist-insights";
import { requireAdminModuleView } from "@/lib/admin-session";

import { requireModule } from "@/lib/modules";
import { getWishlistAdminInsights } from "@/lib/wishlist/query";

export const dynamic = "force-dynamic";

export default async function AdminWishlistPage() {
  const session = await requireAdminModuleView("wishlist");
  await requireModule("wishlist");

  const insights = await getWishlistAdminInsights(session.user.storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Wishlist"
          description="Interés de clientes registrados. Los visitantes sin cuenta guardan favoritos en el navegador."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminWishlistInsights insights={insights} />
      </AdminDashboardReveal>
    </div>
  );
}
