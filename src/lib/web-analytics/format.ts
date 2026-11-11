import type {
  WebTrafficPeriod,
  WebTrafficSeriesGranularity,
} from "@/lib/web-analytics/period";

/** Hobby Web Analytics retention window (days). Pro/Enterprise allow more. */
export const WEB_ANALYTICS_HOBBY_MAX_DAYS = 31;

export function getWebAnalyticsDateRange(
  period: WebTrafficPeriod,
  now = new Date(),
): {
  since: Date;
  until: Date;
  clampedToHobbyWindow: boolean;
  seriesBy: WebTrafficSeriesGranularity;
} {
  const until = new Date(now);

  if (period === "24h") {
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return {
      since,
      until,
      clampedToHobbyWindow: false,
      seriesBy: "hour",
    };
  }

  const since = new Date(now);
  const days = period === "30d" ? 30 : 7;
  const clampedToHobbyWindow = days > WEB_ANALYTICS_HOBBY_MAX_DAYS;
  const effectiveDays = Math.min(days, WEB_ANALYTICS_HOBBY_MAX_DAYS);
  since.setUTCDate(since.getUTCDate() - (effectiveDays - 1));
  since.setUTCHours(0, 0, 0, 0);
  until.setUTCHours(23, 59, 59, 999);

  return {
    since,
    until,
    clampedToHobbyWindow,
    seriesBy: "day",
  };
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

export function formatCountryLabel(raw: string): string {
  const code = raw.trim().toUpperCase();
  if (!code || code === "NULL" || code === "UNDEFINED" || code === "-") {
    return "Desconocido";
  }
  try {
    const name = new Intl.DisplayNames(["es"], { type: "region" }).of(code);
    return name ?? code;
  } catch {
    return code;
  }
}

export function formatTechLabel(raw: string): string {
  const value = raw.trim();
  if (!value || value === "null" || value === "undefined" || value === "-") {
    return "Otro / desconocido";
  }
  if (value.length <= 3) return value.toUpperCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatHourLabel(isoStamp: string): string {
  const date = new Date(isoStamp);
  if (Number.isNaN(date.getTime())) return isoStamp;
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}
