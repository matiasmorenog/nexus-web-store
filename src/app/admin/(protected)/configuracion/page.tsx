import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { requireAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const store = await db.store.findUniqueOrThrow({
    where: { id: session.user.storeId },
  });

  return (
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Configuración"
          description="Envíos y opciones de retiro en local."
        />
      </AdminDashboardReveal>
      <AdminDashboardReveal index={1}>
        <StoreSettingsForm
          store={{
            shippingFlatRate: Number(store.shippingFlatRate),
            allowPickup: store.allowPickup,
          }}
        />
      </AdminDashboardReveal>
    </div>
  );
}
