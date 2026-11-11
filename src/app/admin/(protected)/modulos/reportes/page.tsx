import { Suspense } from "react";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminExportsPanel } from "@/components/admin/admin-exports-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminSkeletonExportsPanel,
  AdminSkeletonSalesAnalytics,
} from "@/components/admin/admin-skeleton";
import { AdminSalesReportsSections } from "@/components/admin/admin-sales-reports-sections";
import { parseActivityPeriod } from "@/lib/admin-analytics";
import { getDefaultAdminOrdersDateRange } from "@/lib/admin-orders-query";
import { requireAdminModuleView } from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  period?: string;
}>;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminModuleView("analytics");
  await requireModule("analytics");

  const params = await searchParams;
  const period = parseActivityPeriod(params.period);
  const { desde, hasta } = getDefaultAdminOrdersDateRange();

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Reportes"
          description="Insights de ventas, comparación de períodos, tops y export CSV."
        />
      </AdminDashboardReveal>

      <Suspense fallback={<AdminSkeletonSalesAnalytics />}>
        <AdminSalesReportsSections
          storeId={session.user.storeId}
          period={period}
        />
      </Suspense>

      <AdminDashboardReveal index={5}>
        <Suspense fallback={<AdminSkeletonExportsPanel />}>
          <AdminExportsPanel defaultDesde={desde} defaultHasta={hasta} />
        </Suspense>
      </AdminDashboardReveal>
    </div>
  );
}
