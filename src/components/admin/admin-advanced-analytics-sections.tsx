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
import { AdminSkeletonTabs } from "@/components/admin/admin-skeleton";
import { AdminTopProducts } from "@/components/admin/admin-top-products";
import {
  ACTIVITY_PERIOD_LABELS,
  getAdminDashboardAnalytics,
  type ActivityPeriod,
} from "@/lib/admin-analytics";
import { getAdvancedAnalyticsReport } from "@/lib/advanced-analytics";

type AdminAdvancedAnalyticsSectionsProps = {
  storeId: string;
  period: ActivityPeriod;
};

export async function AdminAdvancedAnalyticsSections({
  storeId,
  period,
}: AdminAdvancedAnalyticsSectionsProps) {
  const periodLabels = ACTIVITY_PERIOD_LABELS[period];
  const [report, dashboardAnalytics] = await Promise.all([
    getAdvancedAnalyticsReport(storeId, period),
    getAdminDashboardAnalytics(storeId, period),
  ]);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={1}>
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

      <AdminDashboardReveal index={2}>
        <AdminAnalyticsInsightsGrid
          metrics={report.comparison.current}
          cohort={report.cohort}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal
        index={3}
        className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="space-y-6">
          <AdminCard
            title="Actividad de ventas"
            description={periodLabels.description}
            className="overflow-visible"
          >
            <AdminActivityChart
              period={dashboardAnalytics.salesActivity.period}
              data={dashboardAnalytics.salesActivity.points}
              totalOrders={dashboardAnalytics.salesActivity.totalOrders}
              totalRevenue={dashboardAnalytics.salesActivity.totalRevenue}
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
            <AdminTopProducts products={dashboardAnalytics.topProducts} />
          </AdminCard>
          <AdminAnalyticsTopCategories categories={report.topCategories} />
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
