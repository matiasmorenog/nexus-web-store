import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPaymentSettingsForm } from "@/components/admin/admin-payment-settings-form";
import { AdminTransferPaymentForm } from "@/components/admin/admin-transfer-payment-form";
import { requireAdminSession } from "@/lib/admin-session";
import { getStorePaymentSettingsForAdmin } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

export default async function AdminCobrosPage() {
  const session = await requireAdminSession();

  const paymentSettings = await getStorePaymentSettingsForAdmin(session.user.storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Cobros"
          description="Mercado Pago, transferencia con descuento y métodos de pago en checkout."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <div className="space-y-6">
          <AdminPaymentSettingsForm initialSettings={paymentSettings} />
          <AdminTransferPaymentForm
            initialSettings={{
              transferEnabled: paymentSettings.transferEnabled,
              transferInstructions: paymentSettings.transferInstructions,
            }}
          />
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
