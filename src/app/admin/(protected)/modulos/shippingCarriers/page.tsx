import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminShippingSettingsForm } from "@/components/admin/admin-shipping-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminSession } from "@/lib/admin-session";
import { isMercadoEnviosConfigured } from "@/lib/mercado-envios";
import { requireModule } from "@/lib/modules";
import { getStoreShippingSettingsForAdmin } from "@/lib/shipping-carriers/query";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminShippingCarriersPage() {
  await requireAdminSession();
  await requireModule("shippingCarriers");

  const storeId = await getStoreId();
  const settings = await getStoreShippingSettingsForAdmin(storeId);
  const mercadoEnviosConfigured = isMercadoEnviosConfigured();

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Envíos carrier"
          description="Cotización por código postal y etiquetas de seguimiento en checkout."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminShippingSettingsForm
          initialSettings={settings}
          mercadoEnviosConfigured={mercadoEnviosConfigured}
        />
      </AdminDashboardReveal>
    </div>
  );
}
