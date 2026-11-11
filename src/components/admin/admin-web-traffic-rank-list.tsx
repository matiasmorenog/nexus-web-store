"use client";

import { useState } from "react";
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
  /** When true, path rows: click name copies label; path is an external link. */
  linkPaths?: boolean;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

export function AdminWebTrafficRankList({
  rows,
  empty,
  valueKey = "pageviews",
  linkPaths = false,
}: AdminWebTrafficRankListProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="text-sm text-neutral-500">{empty}</p>;
  }

  const max = Math.max(...rows.map((row) => row[valueKey]), 1);

  async function copyLabel(key: string, label: string) {
    try {
      await navigator.clipboard.writeText(label);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1500);
    } catch {
      // Ignore clipboard failures (permissions / insecure context).
    }
  }

  return (
    <ul className="space-y-3">
      {rows.map((row, index) => {
        const value = row[valueKey];
        const width = Math.round((value / max) * 100);
        const title = row.label;
        const path = "path" in row ? row.path : null;
        const rowKey = path ?? `${title}-${index}`;
        const showPathLink = Boolean(linkPaths && path && path !== title);
        const copied = copiedKey === rowKey;

        return (
          <AdminAnimatedMetricRow key={rowKey} index={index}>
            <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium capitalize text-neutral-900">
                  <span className="mr-2 select-none tabular-nums text-neutral-400">
                    {index + 1}.
                  </span>
                  {showPathLink ? (
                    <button
                      type="button"
                      onClick={() => copyLabel(rowKey, title)}
                      aria-label="Copiar nombre"
                      className="relative max-w-full text-left capitalize transition-colors hover:text-[var(--brand-primary)]"
                    >
                      {title}
                      {copied ? (
                        <span
                          role="status"
                          className="pointer-events-none absolute left-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md border border-[var(--brand-primary)] bg-white px-2 py-1 text-[11px] font-medium normal-case tracking-normal text-[var(--brand-primary)] shadow-sm"
                        >
                          Copiado
                          {/* Outer brand triangle + inner white = outlined caret */}
                          <span
                            aria-hidden
                            className="absolute bottom-full left-3 border-[5px] border-transparent border-b-[var(--brand-primary)]"
                          />
                          <span
                            aria-hidden
                            className="absolute bottom-full left-[13px] border-4 border-transparent border-b-white"
                          />
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    title
                  )}
                </p>
                {showPathLink && path ? (
                  <a
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block truncate text-xs text-neutral-500 transition-colors hover:text-[var(--brand-primary)] hover:underline"
                  >
                    {path}
                  </a>
                ) : path && path !== title ? (
                  <p className="truncate text-xs text-neutral-500">{path}</p>
                ) : null}
              </div>
              <div className="shrink-0 select-none text-right tabular-nums text-neutral-700">
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
