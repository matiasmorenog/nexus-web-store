import {
  ACTIVITY_PERIOD_LABELS,
  type ActivityPeriod,
  type ActivityPoint,
} from "@/lib/admin-analytics";
import { cn, formatPrice } from "@/lib/utils";

type AdminActivityChartProps = {
  period: ActivityPeriod;
  data: ActivityPoint[];
  totalOrders: number;
  totalRevenue: number;
};

export function AdminActivityChart({
  period,
  data,
  totalOrders,
  totalRevenue,
}: AdminActivityChartProps) {
  const labels = ACTIVITY_PERIOD_LABELS[period];
  const maxOrders = Math.max(...data.map((point) => point.orders), 1);
  const hasData = data.some((point) => point.orders > 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-neutral-500">Pedidos ({labels.summary})</p>
          <p className="mt-0.5 text-xl font-bold text-neutral-900">{totalOrders}</p>
        </div>
        <div>
          <p className="text-neutral-500">Ingresos ({labels.summary})</p>
          <p className="mt-0.5 text-xl font-bold text-neutral-900">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {!hasData ? (
        <p className="py-10 text-center text-sm text-neutral-500">{labels.empty}</p>
      ) : (
        <div
          className={cn(
            period === "month" &&
              "admin-table-scroll -mx-1 px-1 pb-1 sm:-mx-2 sm:px-2",
          )}
        >
          <div
            className={cn(
              "flex h-52 items-end gap-1 sm:gap-2",
              period === "month" ? "min-w-[30rem]" : "w-full",
            )}
          >
            {data.map((point) => {
              const height = Math.round((point.orders / maxOrders) * 100);

              return (
                <div
                  key={point.key}
                  className={cn(
                    "flex flex-col items-center gap-2",
                    period === "month" ? "w-8 shrink-0 sm:w-9" : "min-w-0 flex-1",
                  )}
                >
                  <span className="text-xs font-semibold text-neutral-700">
                    {point.orders > 0 ? point.orders : ""}
                  </span>
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="w-full max-w-9 rounded-t-md bg-[var(--brand-primary)] transition-[height] sm:max-w-10"
                      style={{
                        height:
                          point.orders > 0 ? `${Math.max(height, 8)}%` : "0%",
                      }}
                      title={`${point.orders} pedido${point.orders !== 1 ? "s" : ""} · ${formatPrice(point.revenue)}`}
                    />
                  </div>
                  <span className="w-full truncate text-center text-[11px] capitalize text-neutral-500">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
