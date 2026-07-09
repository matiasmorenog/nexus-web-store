import { Suspense } from "react";
import {
  AdminDashboardSections,
} from "@/components/admin/admin-dashboard-sections";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  AdminSkeletonDashboardAnalytics,
  AdminSkeletonDashboardAttention,
  AdminSkeletonDashboardRecentOrders,
} from "@/components/admin/admin-skeleton";
import { parseDashboardMonthPeriod } from "@/lib/admin-analytics";
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
  const period = parseDashboardMonthPeriod(params.period);
  const storeDisplayName = await getStoreDisplayName();

  return (
    <div className="pb-2">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Dashboard"
          description={`Resumen de tu tienda ${storeDisplayName}.`}
        />
      </AdminDashboardReveal>

      <Suspense
        fallback={
          <>
            <AdminSkeletonDashboardAttention />
            <AdminSkeletonDashboardAnalytics />
            <AdminSkeletonDashboardRecentOrders />
          </>
        }
      >
        <AdminDashboardSections storeId={storeId} period={period} />
      </Suspense>
    </div>
  );
}
