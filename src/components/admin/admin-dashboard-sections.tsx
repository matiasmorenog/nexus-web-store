import Link from "next/link";
import { Suspense } from "react";
import { AdminActivityChart } from "@/components/admin/admin-activity-chart";
import { AdminActivityPeriodTabs } from "@/components/admin/admin-activity-period-tabs";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminDashboardAttention } from "@/components/admin/admin-dashboard-attention";
import { AdminDashboardRecentOrders } from "@/components/admin/admin-dashboard-recent-orders";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminSkeletonTabs } from "@/components/admin/admin-skeleton";
import { AdminTopProducts } from "@/components/admin/admin-top-products";
import {
  buildAdminRecentOrdersListHref,
  getAdminDashboardAnalytics,
  getAdminDashboardAttention,
  getAdminDashboardPageData,
  getAdminDashboardRecentOrders,
  getDashboardMonthPeriodMeta,
  type DashboardMonthPeriod,
} from "@/lib/admin-analytics";

export async function AdminDashboardAttentionSection({
  storeId,
}: {
  storeId: string;
}) {
  const attention = await getAdminDashboardAttention(storeId);

  return (
    <AdminDashboardReveal index={1}>
      <AdminDashboardAttention attention={attention} />
    </AdminDashboardReveal>
  );
}

export async function AdminDashboardAnalyticsSection({
  storeId,
  period,
}: {
  storeId: string;
  period: DashboardMonthPeriod;
}) {
  const periodLabels = getDashboardMonthPeriodMeta(period);
  const analytics = await getAdminDashboardAnalytics(storeId, period);

  return (
    <AdminDashboardReveal
      index={2}
      className="mb-8 grid items-stretch gap-6 lg:grid-cols-[1.4fr_1fr]"
    >
      <AdminCard
        title="Actividad de ventas"
        description={periodLabels.description}
        className="h-full overflow-visible"
        action={
          <Suspense fallback={<AdminSkeletonTabs />}>
            <AdminActivityPeriodTabs period={period} />
          </Suspense>
        }
      >
        <AdminActivityChart
          period={analytics.salesActivity.period}
          data={analytics.salesActivity.points}
          totalOrders={analytics.salesActivity.totalOrders}
          totalRevenue={analytics.salesActivity.totalRevenue}
          summaryLabel={periodLabels.summary}
          emptyLabel={periodLabels.empty}
        />
      </AdminCard>

      <AdminCard
        title="Productos más vendidos"
        description={`Ranking por unidades vendidas (${periodLabels.summary})`}
        className="h-full"
      >
        <AdminTopProducts products={analytics.topProducts.slice(0, 5)} />
      </AdminCard>
    </AdminDashboardReveal>
  );
}

export async function AdminDashboardRecentOrdersSection({
  storeId,
}: {
  storeId: string;
}) {
  const recentOrders = await getAdminDashboardRecentOrders(storeId);

  return (
    <AdminDashboardReveal index={3}>
      <AdminCard
        title="Pedidos recientes"
        padding={false}
        action={
          <Link
            href={buildAdminRecentOrdersListHref(recentOrders)}
            className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver más
          </Link>
        }
      >
        <AdminDashboardRecentOrders orders={recentOrders} />
      </AdminCard>
    </AdminDashboardReveal>
  );
}

export async function AdminDashboardSections({
  storeId,
  period,
}: {
  storeId: string;
  period: DashboardMonthPeriod;
}) {
  const { attention, analytics, recentOrders } = await getAdminDashboardPageData(
    storeId,
    period,
  );
  const periodLabels = getDashboardMonthPeriodMeta(period);

  return (
    <>
      <AdminDashboardReveal index={1}>
        <AdminDashboardAttention attention={attention} />
      </AdminDashboardReveal>

      <AdminDashboardReveal
        index={2}
        className="mb-8 grid items-stretch gap-6 lg:grid-cols-[1.4fr_1fr]"
      >
        <AdminCard
          title="Actividad de ventas"
          description={periodLabels.description}
          className="h-full overflow-visible"
          action={
            <Suspense fallback={<AdminSkeletonTabs />}>
              <AdminActivityPeriodTabs period={period} />
            </Suspense>
          }
        >
          <AdminActivityChart
            period={analytics.salesActivity.period}
            data={analytics.salesActivity.points}
            totalOrders={analytics.salesActivity.totalOrders}
            totalRevenue={analytics.salesActivity.totalRevenue}
            summaryLabel={periodLabels.summary}
            emptyLabel={periodLabels.empty}
          />
        </AdminCard>

        <AdminCard
          title="Productos más vendidos"
          description={`Ranking por unidades vendidas (${periodLabels.summary})`}
          className="h-full"
        >
          <AdminTopProducts products={analytics.topProducts.slice(0, 5)} />
        </AdminCard>
      </AdminDashboardReveal>

      <AdminDashboardReveal index={3}>
        <AdminCard
          title="Pedidos recientes"
          padding={false}
          action={
            <Link
              href={buildAdminRecentOrdersListHref(recentOrders)}
              className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
            >
              Ver más
            </Link>
          }
        >
          <AdminDashboardRecentOrders orders={recentOrders} />
        </AdminCard>
      </AdminDashboardReveal>
    </>
  );
}
