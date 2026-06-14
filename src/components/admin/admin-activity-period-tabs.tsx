"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITY_PERIOD_LABELS,
  type ActivityPeriod,
} from "@/lib/admin-analytics";
import { cn } from "@/lib/utils";

const PERIODS: ActivityPeriod[] = ["week", "month", "year"];

type AdminActivityPeriodTabsProps = {
  period: ActivityPeriod;
};

export function AdminActivityPeriodTabs({ period }: AdminActivityPeriodTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setPeriod = (next: ActivityPeriod) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "week") params.delete("period");
    else params.set("period", next);
    const qs = params.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  };

  return (
    <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
      {PERIODS.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setPeriod(value)}
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
            period === value
              ? "bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
          )}
        >
          {ACTIVITY_PERIOD_LABELS[value].short}
        </button>
      ))}
    </div>
  );
}
