"use client";

import {
  AdminAnimatedMetricBar,
  AdminAnimatedMetricRow,
} from "@/components/admin/admin-animated-metric-bar";
import type {
  WebAnalyticsNamedRow,
  WebAnalyticsPathRow,
} from "@/lib/web-analytics";

type AdminWebTrafficRankListProps = {
  rows: Array<WebAnalyticsPathRow | WebAnalyticsNamedRow>;
  empty: string;
  valueKey?: "pageviews" | "visitors";
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

export function AdminWebTrafficRankList({
  rows,
  empty,
  valueKey = "pageviews",
}: AdminWebTrafficRankListProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-neutral-500">{empty}</p>;
  }

  const max = Math.max(...rows.map((row) => row[valueKey]), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row, index) => {
        const value = row[valueKey];
        const width = Math.round((value / max) * 100);
        const title = row.label;
        const subtitle = "path" in row ? row.path : null;

        return (
          <AdminAnimatedMetricRow key={`${title}-${index}`} index={index}>
            <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium capitalize text-neutral-900">
                  <span className="mr-2 tabular-nums text-neutral-400">
                    {index + 1}.
                  </span>
                  {title}
                </p>
                {subtitle && subtitle !== title ? (
                  <p className="truncate text-xs text-neutral-500">{subtitle}</p>
                ) : null}
              </div>
              <div className="shrink-0 text-right tabular-nums text-neutral-700">
                <p className="font-medium">{formatCount(value)}</p>
                <p className="text-xs text-neutral-500">
                  {formatCount(row.visitors)} visit.
                </p>
              </div>
            </div>
            <AdminAnimatedMetricBar
              index={index}
              widthPercent={width}
              trackClassName="h-1.5"
            />
          </AdminAnimatedMetricRow>
        );
      })}
    </ul>
  );
}
