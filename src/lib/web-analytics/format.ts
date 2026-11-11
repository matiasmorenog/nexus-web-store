import type { ActivityPeriod } from "@/lib/admin-analytics-shared";

/** Hobby Web Analytics retention window (days). Pro/Enterprise allow more. */
export const WEB_ANALYTICS_HOBBY_MAX_DAYS = 31;

export function getWebAnalyticsDateRange(
  period: ActivityPeriod,
  now = new Date(),
): { since: Date; until: Date; clampedToHobbyWindow: boolean } {
  const until = new Date(now);
  const since = new Date(now);

  let days = 7;
  if (period === "month") days = 30;
  if (period === "year") days = 365;

  const clampedToHobbyWindow = days > WEB_ANALYTICS_HOBBY_MAX_DAYS;
  const effectiveDays = Math.min(days, WEB_ANALYTICS_HOBBY_MAX_DAYS);
  since.setUTCDate(since.getUTCDate() - (effectiveDays - 1));
  since.setUTCHours(0, 0, 0, 0);
  until.setUTCHours(23, 59, 59, 999);

  return { since, until, clampedToHobbyWindow };
}

export function formatProductPathLabel(path: string): string {
  const match = path.match(/^\/(?:producto|prodotto)\/([^/?#]+)/i);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1]).replace(/-/g, " ");
    } catch {
      return match[1].replace(/-/g, " ");
    }
  }
  if (path === "/" || path === "") return "Inicio";
  return path;
}

export function formatDeviceLabel(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key === "mobile") return "Móvil";
  if (key === "desktop") return "Escritorio";
  if (key === "tablet") return "Tablet";
  if (!key || key === "null" || key === "undefined") return "Otro";
  return raw;
}

export function formatReferrerLabel(raw: string): string {
  const value = raw.trim();
  if (!value || value === "null" || value === "undefined" || value === "-") {
    return "Directo / desconocido";
  }
  return value;
}
