import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminShippingSettingsForm } from "@/components/admin/admin-shipping-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  adminCanManageModule,
  requireAdminModuleView,
} from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";
import { getStoreShippingSettingsForAdmin } from "@/lib/shipping-carriers/query";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminShippingCarriersPage() {
  const session = await requireAdminModuleView("shippingCarriers");
  await requireModule("shippingCarriers");

  const storeId = await getStoreId();
  const settings = await getStoreShippingSettingsForAdmin(storeId);
  const canManageShipping = adminCanManageModule(session, "shippingCarriers");

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Envíos carrier"
          description="Cotización Mercado Envíos por CP, retiro en local y seguimiento de pedidos."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminShippingSettingsForm
          initialSettings={settings}
          readOnly={!canManageShipping}
        />
      </AdminDashboardReveal>
    </div>
  );
}
