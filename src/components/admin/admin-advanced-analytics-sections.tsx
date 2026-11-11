import { Suspense } from "react";
import { AdminActivityChart } from "@/components/admin/admin-activity-chart";
import { AdminAnalyticsComparisonCards } from "@/components/admin/admin-analytics-comparison-cards";
import { AdminAnalyticsExportButton } from "@/components/admin/admin-analytics-export-button";
import { AdminAnalyticsInsightsGrid } from "@/components/admin/admin-analytics-insights-grid";
import { AdminAnalyticsPeriodTabs } from "@/components/admin/admin-analytics-period-tabs";
import { AdminAnalyticsLoyalCustomers } from "@/components/admin/admin-analytics-loyal-customers";
import { AdminAnalyticsTopCategories } from "@/components/admin/admin-analytics-top-categories";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import {
  AdminSkeletonSalesAnalytics,
  AdminSkeletonTabs,
  AdminSkeletonWebTraffic,
} from "@/components/admin/admin-skeleton";
import { AdminTopProducts } from "@/components/admin/admin-top-products";
import { AdminWebTrafficSection } from "@/components/admin/admin-web-traffic-section";
import {
  ACTIVITY_PERIOD_LABELS,
  getActivityPeriodAnalytics,
  type ActivityPeriod,
} from "@/lib/admin-analytics";
import { getAdvancedAnalyticsReport } from "@/lib/advanced-analytics";
import { getWebAnalyticsReport } from "@/lib/web-analytics";

type AdminAdvancedAnalyticsSectionsProps = {
  storeId: string;
  period: ActivityPeriod;
};

async function AdminWebTrafficAnalyticsBlock({
  period,
}: {
  period: ActivityPeriod;
}) {
  const webTraffic = await getWebAnalyticsReport(period);

  return (
    <AdminDashboardReveal index={1}>
      <AdminWebTrafficSection period={period} report={webTraffic} />
    </AdminDashboardReveal>
  );
}

async function AdminSalesAnalyticsBlock({
  storeId,
  period,
}: {
  storeId: string;
  period: ActivityPeriod;
}) {
  const periodLabels = ACTIVITY_PERIOD_LABELS[period];
  // Neon pooler connection_limit=1 — serialize report + activity (no Promise.all).
  const report = await getAdvancedAnalyticsReport(storeId, period);
  const periodAnalytics = await getActivityPeriodAnalytics(storeId, period);

  return (
    <>
      <AdminDashboardReveal index={2}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Comparación contra el período anterior ({periodLabels.summary}).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <AdminAnalyticsExportButton period={period} />
            <Suspense fallback={<AdminSkeletonTabs />}>
              <AdminAnalyticsPeriodTabs period={period} />
            </Suspense>
          </div>
        </div>
        <AdminAnalyticsComparisonCards comparison={report.comparison} />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={3}>
        <AdminAnalyticsInsightsGrid
          metrics={report.comparison.current}
          cohort={report.cohort}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal
        index={4}
        className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="space-y-6">
          <AdminCard
            title="Actividad de ventas"
            description={periodLabels.description}
            className="overflow-visible"
            action={
              <Suspense fallback={<AdminSkeletonTabs />}>
                <AdminAnalyticsPeriodTabs period={period} />
              </Suspense>
            }
          >
            <AdminActivityChart
              period={periodAnalytics.salesActivity.period}
              data={periodAnalytics.salesActivity.points}
              totalOrders={periodAnalytics.salesActivity.totalOrders}
              totalRevenue={periodAnalytics.salesActivity.totalRevenue}
            />
          </AdminCard>
          <AdminAnalyticsLoyalCustomers
            storeId={storeId}
            customers={report.loyalCustomers}
          />
        </div>

        <div className="space-y-6">
          <AdminCard
            title="Top productos"
            description={`Ranking extendido (${periodLabels.summary})`}
          >
            <AdminTopProducts products={periodAnalytics.topProducts} />
          </AdminCard>
          <AdminAnalyticsTopCategories categories={report.topCategories} />
        </div>
      </AdminDashboardReveal>
    </>
  );
}

/** Sync shell: web (Vercel API) and sales (Neon) stream in separate Suspense trees. */
export function AdminAdvancedAnalyticsSections({
  storeId,
  period,
}: AdminAdvancedAnalyticsSectionsProps) {
  return (
    <div className="space-y-8">
      <Suspense fallback={<AdminSkeletonWebTraffic />}>
        <AdminWebTrafficAnalyticsBlock period={period} />
      </Suspense>
      <Suspense fallback={<AdminSkeletonSalesAnalytics />}>
        <AdminSalesAnalyticsBlock storeId={storeId} period={period} />
      </Suspense>
    </div>
  );
}
