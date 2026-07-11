import { AdminCard } from "@/components/admin/admin-card";
import type { AnalyticsPeriodMetrics } from "@/lib/advanced-analytics";
import { cn } from "@/lib/utils";

type AdminAnalyticsFunnelProps = {
  metrics: AnalyticsPeriodMetrics;
  className?: string;
};

function formatRate(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function AdminAnalyticsFunnel({
  metrics,
  className,
}: AdminAnalyticsFunnelProps) {
  const created = metrics.orders;
  const paid = metrics.paidOrders;
  const cancelled = metrics.cancelledOrders;
  const cancelRate = created > 0 ? (cancelled / created) * 100 : 0;
  const max = Math.max(created, paid, cancelled, 1);

  const steps = [
    {
      label: "Creados",
      value: created,
      tone: "bg-neutral-800",
      track: "bg-neutral-100",
    },
    {
      label: "Pagados / enviados",
      value: paid,
      tone: "bg-emerald-600",
      track: "bg-emerald-50",
    },
    {
      label: "Cancelados",
      value: cancelled,
      tone: "bg-red-500",
      track: "bg-red-50",
    },
  ] as const;

  return (
    <AdminCard
      title="Embudo de pedidos"
      description="Del pedido creado al cobro efectivo en el período actual."
      className={className}
    >
      <div className="space-y-4">
        {steps.map((step) => {
          const widthPct = Math.max((step.value / max) * 100, step.value > 0 ? 4 : 0);
          return (
            <div key={step.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-neutral-600">{step.label}</span>
                <span className="font-semibold tabular-nums text-neutral-900">
                  {step.value}
                </span>
              </div>
              <div className={cn("h-2.5 overflow-hidden rounded-full", step.track)}>
                <div
                  className={cn("h-full rounded-full transition-all", step.tone)}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 text-sm">
          <div>
            <p className="text-neutral-500">Conversión a cobro</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-neutral-900">
              {formatRate(metrics.conversionRate)}
            </p>
          </div>
          <div>
            <p className="text-neutral-500">Tasa de cancelación</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums text-neutral-900">
              {formatRate(cancelRate)}
            </p>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
