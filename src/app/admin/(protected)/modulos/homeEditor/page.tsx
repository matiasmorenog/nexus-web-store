import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminHomeEditor } from "@/components/admin/admin-home-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminSession } from "@/lib/admin-session";
import { getStoreHomeContentForAdmin } from "@/lib/home-content/query";
import { requireModule } from "@/lib/modules";
import { getStorefrontKind } from "@/lib/store-verticals";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminHomeEditorPage() {
  await requireAdminSession();
  await requireModule("homeEditor");

  const storeId = await getStoreId();
  const vertical = getStorefrontKind();
  const payload = await getStoreHomeContentForAdmin(storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Home editable"
          description={
            vertical === "vape"
              ? "Hero estático, beneficios, categorías, promo y newsletter sin tocar código."
              : "Carrusel hero, destacados y categorías sin tocar código."
          }
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminHomeEditor initialPayload={payload} vertical={vertical} />
      </AdminDashboardReveal>
    </div>
  );
}
