import { Suspense } from "react";
import { AdminOrdersPageContent } from "@/components/admin/admin-orders-sections";
import { AdminOrdersUrlDefaults } from "@/components/admin/admin-orders-url-defaults";
import { AdminSkeletonOrdersPage } from "@/components/admin/admin-skeleton";
import { getActiveAdminOrderFilterChips } from "@/lib/admin-order-filters";
import { resolveAdminOrdersFilters } from "@/lib/admin-orders-query";
import {
  adminCanManage,
  requireAdminPermission,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  estado?: string;
  q?: string;
  desde?: string;
  hasta?: string;
  todos?: string;
}>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminPermission("orders:view");
  const storeId = session.user.storeId;
  const canManageOrders = adminCanManage(session, "orders:manage");

  const params = await searchParams;
  const filters = resolveAdminOrdersFilters(params);

  const needsUrlDefaults =
    params.todos !== "1" && !params.desde && !params.hasta;

  const filterChips = getActiveAdminOrderFilterChips(filters);

  return (
    <div>
      {needsUrlDefaults && filters.desde && filters.hasta ? (
        <AdminOrdersUrlDefaults
          desde={filters.desde}
          hasta={filters.hasta}
        />
      ) : null}

      <Suspense fallback={<AdminSkeletonOrdersPage />}>
        <AdminOrdersPageContent
          storeId={storeId}
          filters={filters}
          params={params}
          filterChips={filterChips}
          canManageOrders={canManageOrders}
        />
      </Suspense>
    </div>
  );
}
