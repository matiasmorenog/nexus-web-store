import { Suspense } from "react";
import { AdminAdvancedAnalyticsSections } from "@/components/admin/admin-advanced-analytics-sections";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminExportsPanel } from "@/components/admin/admin-exports-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSkeletonAdvancedAnalytics } from "@/components/admin/admin-skeleton";
import { parseActivityPeriod } from "@/lib/admin-analytics";
import { getDefaultAdminOrdersDateRange } from "@/lib/admin-orders-query";
import { requireAdminModuleView } from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  period?: string;
}>;

export default async function AdminAnalyticsPage({
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
          title="Analytics y reportes"
          description="Insights de ventas, comparación de períodos y export CSV de reportes, pedidos y catálogo."
        />
      </AdminDashboardReveal>

      <Suspense fallback={<AdminSkeletonAdvancedAnalytics />}>
        <AdminAdvancedAnalyticsSections
          storeId={session.user.storeId}
          period={period}
        />
      </Suspense>

      <AdminDashboardReveal index={4}>
        <AdminExportsPanel defaultDesde={desde} defaultHasta={hasta} />
      </AdminDashboardReveal>
    </div>
  );
}
