import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPaymentSettingsForm } from "@/components/admin/admin-payment-settings-form";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { requireAdminSession } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { getStorePaymentSettingsForAdmin } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const store = await db.store.findUniqueOrThrow({
    where: { id: session.user.storeId },
  });
  const paymentSettings = await getStorePaymentSettingsForAdmin(session.user.storeId);

  return (
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Configuración"
          description="Pagos, envíos y opciones de retiro en local."
        />
      </AdminDashboardReveal>
      <AdminDashboardReveal index={1}>
        <div className="space-y-6">
          <AdminPaymentSettingsForm initialSettings={paymentSettings} />
          <StoreSettingsForm
            store={{
              shippingFlatRate: Number(store.shippingFlatRate),
              allowPickup: store.allowPickup,
            }}
          />
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
