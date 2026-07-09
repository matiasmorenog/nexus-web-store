"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getDashboardMonthPeriodMeta,
  type DashboardMonthPeriod,
} from "@/lib/admin-analytics-shared";
import { cn } from "@/lib/utils";

const PERIODS: DashboardMonthPeriod[] = ["current", "previous"];

type AdminActivityPeriodTabsProps = {
  period: DashboardMonthPeriod;
};

function buildPeriodHref(
  next: DashboardMonthPeriod,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (next === "current") params.delete("period");
  else params.set("period", next);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

export function AdminActivityPeriodTabs({ period }: AdminActivityPeriodTabsProps) {
  const searchParams = useSearchParams();

  return (
    <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
      {PERIODS.map((value) => (
        <Link
          key={value}
          href={buildPeriodHref(value, searchParams)}
          scroll={false}
          aria-current={period === value ? "page" : undefined}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
            period === value
              ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
          )}
        >
          {getDashboardMonthPeriodMeta(value).short}
        </Link>
      ))}
    </div>
  );
}
