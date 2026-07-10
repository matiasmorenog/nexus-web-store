import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminExportsPanel } from "@/components/admin/admin-exports-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminSession } from "@/lib/admin-session";
import { getDefaultAdminOrdersDateRange } from "@/lib/admin-orders-query";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

export default async function AdminExportsPage() {
  await requireAdminSession();
  await requireModule("exports");

  const { desde, hasta } = getDefaultAdminOrdersDateRange();

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Export y reportes"
          description="Descargá pedidos y productos en CSV para contabilidad o análisis externo."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminExportsPanel defaultDesde={desde} defaultHasta={hasta} />
      </AdminDashboardReveal>
    </div>
  );
}
