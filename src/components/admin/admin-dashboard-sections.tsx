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
  ACTIVITY_PERIOD_LABELS,
  getAdminDashboardAnalytics,
  getAdminDashboardAttention,
  getAdminDashboardRecentOrders,
  type ActivityPeriod,
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
  period: ActivityPeriod;
}) {
  const periodLabels = ACTIVITY_PERIOD_LABELS[period];
  const analytics = await getAdminDashboardAnalytics(storeId, period);

  return (
    <AdminDashboardReveal
      index={2}
      className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]"
    >
      <AdminCard
        title="Actividad de ventas"
        description={periodLabels.description}
        className="overflow-visible"
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
        />
      </AdminCard>

      <AdminCard
        title="Productos más vendidos"
        description={`Ranking por unidades vendidas (${periodLabels.summary})`}
      >
        <AdminTopProducts products={analytics.topProducts} />
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
            href="/admin/pedidos?todos=1"
            className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
          >
            Ver todos
          </Link>
        }
      >
        <AdminDashboardRecentOrders orders={recentOrders} />
      </AdminCard>
    </AdminDashboardReveal>
  );
}
