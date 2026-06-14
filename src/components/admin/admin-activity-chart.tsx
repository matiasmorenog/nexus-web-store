"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACTIVITY_PERIOD_LABELS,
  aggregateActivityIntoWeeks,
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

const MOBILE_MEDIA_QUERY = "(max-width: 639px)";

const PLOT = {
  top: 22,
  bottom: 8,
  height: 100,
  width: 100,
} as const;

const HORIZONTAL_INSET = 2.5;
const SERIES_STROKE = 2.5;
const TOOLTIP_FLIP_THRESHOLD = 28;

type PlotPoint = {
  x: number;
  y: number;
  point: ActivityPoint;
};

function bucketX(index: number, count: number): number {
  if (count === 1) return PLOT.width / 2;

  const span = PLOT.width - HORIZONTAL_INSET * 2;
  return HORIZONTAL_INSET + (index / (count - 1)) * span;
}

function buildPlotPoints(data: ActivityPoint[], maxOrders: number): PlotPoint[] {
  const plotHeight = PLOT.height - PLOT.top - PLOT.bottom;

  return data.map((point, index) => ({
    x: bucketX(index, data.length),
    y: PLOT.top + plotHeight - (point.orders / maxOrders) * plotHeight,
    point,
  }));
}

function ChartTooltip({
  plot,
  showBelow,
}: {
  plot: PlotPoint;
  showBelow: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 w-max max-w-[9.5rem] -translate-x-1/2 rounded-lg border border-neutral-200/80 bg-white px-3 py-2 text-center shadow-md",
        showBelow ? "translate-y-2" : "-translate-y-full -mt-2",
      )}
      style={{
        left: `${plot.x}%`,
        top: `${plot.y}%`,
      }}
    >
      <p className="text-xs font-semibold text-neutral-900">
        {plot.point.orders} pedido{plot.point.orders !== 1 ? "s" : ""}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-[var(--brand-primary)]">
        {formatPrice(plot.point.revenue)}
      </p>
    </div>
  );
}

function ActivityLineSvg({ plotPoints }: { plotPoints: PlotPoint[] }) {
  const plotHeight = PLOT.height - PLOT.top - PLOT.bottom;
  const bottomY = PLOT.top + plotHeight;

  const linePath = plotPoints
    .map((plot, index) => `${index === 0 ? "M" : "L"} ${plot.x} ${plot.y}`)
    .join(" ");

  const first = plotPoints[0];
  const last = plotPoints[plotPoints.length - 1];
  const areaPath = [linePath, `L ${last.x} ${bottomY}`, `L ${first.x} ${bottomY}`, "Z"].join(
    " ",
  );

  return (
    <svg
      viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id="activity-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = PLOT.top + plotHeight * (1 - ratio);
        return (
          <line
            key={ratio}
            x1={0}
            x2={PLOT.width}
            y1={y}
            y2={y}
            className="stroke-neutral-100"
            strokeWidth={0.4}
          />
        );
      })}

      <path d={areaPath} fill="url(#activity-area)" />
      <path
        d={linePath}
        fill="none"
        className="stroke-[var(--brand-primary)]"
        strokeWidth={SERIES_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA_QUERY);
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function AdminActivityChart({
  period,
  data,
  totalOrders,
  totalRevenue,
}: AdminActivityChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const labels = ACTIVITY_PERIOD_LABELS[period];
  const showMonthAsWeeks = period === "month" && isMobile;

  const chartData = useMemo(() => {
    if (showMonthAsWeeks) return aggregateActivityIntoWeeks(data);
    return data;
  }, [data, showMonthAsWeeks]);

  const maxOrders = Math.max(...chartData.map((point) => point.orders), 1);
  const hasData = chartData.some((point) => point.orders > 0);

  const plotPoints = useMemo(
    () => buildPlotPoints(chartData, maxOrders),
    [chartData, maxOrders],
  );

  const activePlot = plotPoints.find((plot) => plot.point.key === activeKey) ?? null;
  const showTooltipBelow = activePlot ? activePlot.y < TOOLTIP_FLIP_THRESHOLD : false;

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
        <div>
          <p className="mb-2 text-xs text-neutral-400">
            {showMonthAsWeeks
              ? "Vista por semanas en mobile. Pasá el mouse o tocá un punto para ver pedidos e ingresos."
              : "Pasá el mouse o tocá un punto para ver pedidos e ingresos del período."}
          </p>

          <div
            className={cn(
              period === "month" &&
                !isMobile &&
                "admin-table-scroll -mx-1 overflow-y-visible px-1 pb-1 sm:-mx-2 sm:px-2",
            )}
          >
            <div
              className={cn(
                period === "month" && !isMobile ? "min-w-[35rem]" : "w-full",
              )}
            >
              <div className="relative h-44 overflow-visible sm:h-48">
                <ActivityLineSvg plotPoints={plotPoints} />

                {plotPoints.map((plot) => {
                  const isActive = activeKey === plot.point.key;

                  return (
                    <button
                      key={plot.point.key}
                      type="button"
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-manipulation"
                      style={{ left: `${plot.x}%`, top: `${plot.y}%` }}
                      onMouseEnter={() => setActiveKey(plot.point.key)}
                      onMouseLeave={() => setActiveKey(null)}
                      onClick={() =>
                        setActiveKey(isActive ? null : plot.point.key)
                      }
                      aria-label={`${plot.point.label}: ${plot.point.orders} pedidos, ${formatPrice(plot.point.revenue)}`}
                    >
                      <span
                        className={cn(
                          "block rounded-full border-[var(--brand-primary)] bg-white transition-transform",
                          isActive
                            ? "size-[17px] shadow-sm"
                            : "size-3.5",
                        )}
                        style={{ borderWidth: SERIES_STROKE }}
                      />
                    </button>
                  );
                })}

                {activePlot && activePlot.point.orders > 0 ? (
                  <ChartTooltip plot={activePlot} showBelow={showTooltipBelow} />
                ) : null}
              </div>

              <div className="relative mt-2 h-5 w-full">
                {plotPoints.map((plot) => (
                  <span
                    key={plot.point.key}
                    className={cn(
                      "absolute -translate-x-1/2 truncate text-center text-[11px] capitalize text-neutral-500",
                      period === "month" && !isMobile ? "max-w-8" : "max-w-[3.5rem]",
                      activeKey === plot.point.key &&
                        "font-semibold text-[var(--brand-primary)]",
                    )}
                    style={{ left: `${plot.x}%` }}
                  >
                    {plot.point.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
