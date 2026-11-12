"use client";

import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { buildCrmListHref } from "@/lib/crm";
import type { CrmStoreStats } from "@/lib/crm";

type AdminCrmKpisProps = {
  stats: CrmStoreStats;
};

export function AdminCrmKpis({ stats }: AdminCrmKpisProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Clientes"
        value={stats.customerCount}
        icon="users"
        accent="brand"
        delay={0}
      />
      <AdminStatCard
        label="LTV medio"
        value={stats.averageLtv}
        format="currency"
        icon="dollar-sign"
        accent="green"
        delay={80}
      />
      <AdminStatCard
        label="Recompra"
        value={stats.repurchaseRate}
        format="percent"
        icon="trending-up"
        accent="blue"
        delay={160}
      />
      <AdminStatCard
        label="Inactivos 30d"
        value={stats.inactive30Count}
        icon="package"
        accent="amber"
        delay={240}
        href={buildCrmListHref({ inactiveDays: 30 })}
      />
    </div>
  );
}
