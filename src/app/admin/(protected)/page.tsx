import Link from "next/link";
import { Suspense } from "react";
import {
  AdminDashboardAnalyticsSection,
  AdminDashboardAttentionSection,
  AdminDashboardRecentOrdersSection,
} from "@/components/admin/admin-dashboard-sections";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminSkeletonDashboardAnalytics,
  AdminSkeletonDashboardAttention,
  AdminSkeletonDashboardRecentOrders,
} from "@/components/admin/admin-skeleton";
import { parseActivityPeriod } from "@/lib/admin-analytics";
import { requireAdminSession } from "@/lib/admin-session";
import { getStoreDisplayName } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await requireAdminSession();
  const storeId = session.user.storeId;

  const params = await searchParams;
  const period = parseActivityPeriod(params.period);
  const storeDisplayName = await getStoreDisplayName();

  return (
    <div className="pb-2">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Dashboard"
          description={`Resumen de tu tienda ${storeDisplayName}.`}
        />
      </AdminDashboardReveal>

      <Suspense fallback={<AdminSkeletonDashboardAttention />}>
        <AdminDashboardAttentionSection storeId={storeId} />
      </Suspense>

      <Suspense fallback={<AdminSkeletonDashboardAnalytics />}>
        <AdminDashboardAnalyticsSection storeId={storeId} period={period} />
      </Suspense>

      <Suspense fallback={<AdminSkeletonDashboardRecentOrders />}>
        <AdminDashboardRecentOrdersSection storeId={storeId} />
      </Suspense>
    </div>
  );
}
