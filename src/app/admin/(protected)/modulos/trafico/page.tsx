import { Suspense } from "react";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSkeletonWebTraffic } from "@/components/admin/admin-skeleton";
import { AdminWebTrafficSection } from "@/components/admin/admin-web-traffic-section";
import { requireAdminModuleView } from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";
import { getWebAnalyticsReport } from "@/lib/web-analytics";
import { parseWebTrafficPeriod } from "@/lib/web-analytics/period";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  period?: string;
}>;

async function AdminTrafficBody({ period }: { period: ReturnType<typeof parseWebTrafficPeriod> }) {
  const report = await getWebAnalyticsReport(period);
  return <AdminWebTrafficSection period={period} report={report} />;
}

export default async function AdminTrafficPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminModuleView("analytics");
  await requireModule("analytics");

  const params = await searchParams;
  const period = parseWebTrafficPeriod(params.period);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Tráfico"
          description="Visitas reales de tu tienda: totales, tendencia, páginas, país, browser y dispositivos."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <Suspense fallback={<AdminSkeletonWebTraffic />}>
          <AdminTrafficBody period={period} />
        </Suspense>
      </AdminDashboardReveal>
    </div>
  );
}
