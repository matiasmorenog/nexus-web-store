import type { ActivityPeriod } from "@/lib/admin-analytics-shared";
import type { AnalyticsDateRange, AnalyticsPeriodRanges } from "@/lib/advanced-analytics/types";

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function shiftDays(date: Date, days: number): Date {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

export function getAnalyticsPeriodRanges(
  period: ActivityPeriod,
): AnalyticsPeriodRanges {
  const today = startOfDay(new Date());

  if (period === "week") {
    const currentStart = shiftDays(today, -6);
    const previousEnd = shiftDays(currentStart, -1);
    const previousStart = shiftDays(previousEnd, -6);

    return {
      current: { start: currentStart, end: endOfDay(today) },
      previous: { start: previousStart, end: endOfDay(previousEnd) },
    };
  }

  if (period === "month") {
    const currentStart = shiftDays(today, -29);
    const previousEnd = shiftDays(currentStart, -1);
    const previousStart = shiftDays(previousEnd, -29);

    return {
      current: { start: currentStart, end: endOfDay(today) },
      previous: { start: previousStart, end: endOfDay(previousEnd) },
    };
  }

  const currentStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const previousEnd = new Date(currentStart);
  previousEnd.setDate(0);
  const previousStart = new Date(
    previousEnd.getFullYear(),
    previousEnd.getMonth() - 11,
    1,
  );

  return {
    current: { start: currentStart, end: endOfDay(today) },
    previous: { start: previousStart, end: endOfDay(previousEnd) },
  };
}

export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }

  return ((current - previous) / previous) * 100;
}

export function formatPercentChange(value: number | null): string {
  if (value == null) return "—";
  const rounded = Math.round(value * 10) / 10;
  const prefix = rounded > 0 ? "+" : "";
  return `${prefix}${rounded}%`;
}
