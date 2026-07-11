import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPaymentSettingsForm } from "@/components/admin/admin-payment-settings-form";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import {
  adminCanManage,
  requireAdminPermission,
} from "@/lib/admin-session";
import { db } from "@/lib/db";
import { getStorePaymentSettingsForAdmin } from "@/lib/payments";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireAdminPermission("config:view");
  const canManageConfig = adminCanManage(session, "config:manage");
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
          <AdminPaymentSettingsForm
            initialSettings={paymentSettings}
            readOnly={!canManageConfig}
          />
          <StoreSettingsForm
            store={{
              shippingFlatRate: Number(store.shippingFlatRate),
              allowPickup: store.allowPickup,
            }}
            readOnly={!canManageConfig}
          />
          <ChangePasswordForm variant="admin" />
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
