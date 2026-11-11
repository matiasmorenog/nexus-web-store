import type { WebAnalyticsDayPoint } from "@/lib/web-analytics";
import { cn } from "@/lib/utils";

type AdminWebTrafficDailyChartProps = {
  points: WebAnalyticsDayPoint[];
  seriesBy: "hour" | "day";
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

export function AdminWebTrafficDailyChart({
  points,
  seriesBy,
}: AdminWebTrafficDailyChartProps) {
  if (points.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Sin serie en este período.
      </p>
    );
  }

  const maxPageviews = Math.max(...points.map((point) => point.pageviews), 1);
  const labelStep =
    seriesBy === "hour"
      ? points.length > 12
        ? 3
        : 2
      : points.length > 14
        ? 3
        : points.length > 8
          ? 2
          : 1;

  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-1 sm:gap-1.5">
        {points.map((point) => {
          const height = Math.max(
            4,
            Math.round((point.pageviews / maxPageviews) * 100),
          );
          return (
            <div
              key={point.date}
              className="group relative flex min-w-0 flex-1 flex-col justify-end"
              title={`${point.label}: ${formatCount(point.pageviews)} vistas · ${formatCount(point.visitors)} visit.`}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm bg-neutral-900/80 transition-colors group-hover:bg-neutral-900",
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 sm:gap-1.5">
        {points.map((point, index) => (
          <div
            key={`${point.date}-label`}
            className="min-w-0 flex-1 text-center text-[10px] leading-tight text-neutral-400 sm:text-xs"
          >
            {index % labelStep === 0 || index === points.length - 1
              ? point.label
              : ""}
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-500">
        Barras = pageviews por {seriesBy === "hour" ? "hora" : "día"}. Hover
        para visitantes.
      </p>
    </div>
  );
}
