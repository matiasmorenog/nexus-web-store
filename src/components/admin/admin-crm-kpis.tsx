import Link from "next/link";
import { AdminCard } from "@/components/admin/admin-card";
import { buildCrmListHref, type CrmStoreStats } from "@/lib/crm";
import { formatPrice } from "@/lib/utils";

type AdminCrmKpisProps = {
  stats: CrmStoreStats;
};

function MetricCard({
  label,
  description,
  value,
  href,
}: {
  label: string;
  description: string;
  value: string;
  href?: string;
}) {
  const body = (
    <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">
      {value}
    </p>
  );

  return (
    <AdminCard title={label} description={description} className="h-full">
      {href ? (
        <Link
          href={href}
          className="block transition-colors hover:text-[var(--brand-primary)]"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </AdminCard>
  );
}

export function AdminCrmKpis({ stats }: AdminCrmKpisProps) {
  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Clientes"
        description="Compradores con al menos un pedido."
        value={stats.customerCount.toLocaleString("es-AR")}
      />
      <MetricCard
        label="LTV medio"
        description="Gasto promedio por cliente."
        value={formatPrice(stats.averageLtv)}
      />
      <MetricCard
        label="Recompra"
        description="% con 2 o más pedidos."
        value={`${Math.round(stats.repurchaseRate).toLocaleString("es-AR")}%`}
      />
      <MetricCard
        label="Inactivos 30d"
        description="Sin comprar en los últimos 30 días."
        value={stats.inactive30Count.toLocaleString("es-AR")}
        href={buildCrmListHref({ inactiveDays: 30 })}
      />
    </div>
  );
}
