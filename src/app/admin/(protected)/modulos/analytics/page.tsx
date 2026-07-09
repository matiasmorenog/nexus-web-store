import { Suspense } from "react";
import { AdminAdvancedAnalyticsSections } from "@/components/admin/admin-advanced-analytics-sections";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSkeletonDashboardAnalytics } from "@/components/admin/admin-skeleton";
import { parseActivityPeriod } from "@/lib/admin-analytics";
import { requireAdminSession } from "@/lib/admin-session";
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
  const session = await requireAdminSession();
  await requireModule("analytics");

  const params = await searchParams;
  const period = parseActivityPeriod(params.period);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Analytics avanzado"
          description="Comparación vs período anterior, embudo, retention semanal, top productos/categorías y export CSV."
        />
      </AdminDashboardReveal>

      <Suspense fallback={<AdminSkeletonDashboardAnalytics />}>
        <AdminAdvancedAnalyticsSections
          storeId={session.user.storeId}
          period={period}
        />
      </Suspense>
    </div>
  );
}
