import { AdminCard } from "@/components/admin/admin-card";
import { formatPercentChange } from "@/lib/advanced-analytics";
import type { AnalyticsPeriodComparison } from "@/lib/advanced-analytics";
import { cn, formatPrice } from "@/lib/utils";

type AdminAnalyticsComparisonCardsProps = {
  comparison: AnalyticsPeriodComparison;
};

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-xs text-neutral-400">sin período anterior</span>;
  }

  const positive = value >= 0;

  return (
    <span
      className={cn(
        "text-xs font-medium",
        positive ? "text-emerald-600" : "text-red-600",
      )}
    >
      {formatPercentChange(value)} vs período anterior
    </span>
  );
}

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: number | null;
}) {
  return (
    <AdminCard title={label} className="h-full">
      <p className="text-3xl font-bold tracking-tight text-neutral-900">{value}</p>
      <div className="mt-2">
        <ChangeBadge value={change} />
      </div>
    </AdminCard>
  );
}

export function AdminAnalyticsComparisonCards({
  comparison,
}: AdminAnalyticsComparisonCardsProps) {
  const { current } = comparison;

  return (
    <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Ingresos"
        value={formatPrice(current.revenue)}
        change={comparison.revenueChangePct}
      />
      <MetricCard
        label="Pedidos pagados"
        value={String(current.paidOrders)}
        change={comparison.paidOrdersChangePct}
      />
      <MetricCard
        label="Ticket promedio"
        value={formatPrice(current.averageOrderValue)}
        change={comparison.aovChangePct}
      />
      <MetricCard
        label="Pedidos creados"
        value={String(current.orders)}
        change={comparison.ordersChangePct}
      />
    </div>
  );
}
