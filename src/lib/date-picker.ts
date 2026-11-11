/**
 * Date helpers for admin pickers (America/Argentina/Buenos_Aires wall calendar).
 */

export const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function argentinaTodayYmd(now = new Date()): string {
  return now
    .toLocaleDateString("en-CA", { timeZone: ARGENTINA_TZ })
    .slice(0, 10);
}

function addDaysYmd(ymd: string, days: number): string {
  const match = DATE_ONLY_RE.exec(ymd);
  if (!match) throw new Error(`Invalid YMD: ${ymd}`);
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function mondayIndexFromYmd(ymd: string): number {
  const match = DATE_ONLY_RE.exec(ymd);
  if (!match) throw new Error(`Invalid YMD: ${ymd}`);
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const sun0 = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (sun0 + 6) % 7;
}

function mondayOfWeekContaining(ymd: string): string {
  return addDaysYmd(ymd, -mondayIndexFromYmd(ymd));
}

function lastDayOfMonthYmd(year: number, month1to12: number): string {
  const last = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
  return `${year}-${String(month1to12).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

/** Monday of current week → today (Argentina). */
export function thisWeekFilterDateRange(now = new Date()): {
  from: string;
  to: string;
} {
  const to = argentinaTodayYmd(now);
  return { from: mondayOfWeekContaining(to), to };
}

/** Previous calendar week Monday → Sunday (Argentina). */
export function previousWeekFilterDateRange(now = new Date()): {
  from: string;
  to: string;
} {
  const today = argentinaTodayYmd(now);
  const thisMonday = mondayOfWeekContaining(today);
  const from = addDaysYmd(thisMonday, -7);
  const to = addDaysYmd(thisMonday, -1);
  return { from, to };
}

/** 1st of current month → today (Argentina). */
export function thisMonthFilterDateRange(now = new Date()): {
  from: string;
  to: string;
} {
  const to = argentinaTodayYmd(now);
  const from = `${to.slice(0, 8)}01`;
  return { from, to };
}

/** Previous calendar month 1st → last day (Argentina). */
export function previousMonthFilterDateRange(now = new Date()): {
  from: string;
  to: string;
} {
  const today = argentinaTodayYmd(now);
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const prevYear = m === 1 ? y - 1 : y;
  const prevMonth = m === 1 ? 12 : m - 1;
  const from = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  const to = lastDayOfMonthYmd(prevYear, prevMonth);
  return { from, to };
}

export function formatYmdDisplay(ymd: string): string {
  const m = DATE_ONLY_RE.exec(ymd.trim());
  if (!m) return ymd;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString("es-AR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatYmdRangeDisplay(from: string, to: string): string {
  const fromYmd = from.trim();
  const toYmd = to.trim();
  if (!fromYmd && !toYmd) return "Elegir rango";
  if (fromYmd && toYmd) {
    return `${formatYmdDisplay(fromYmd)} – ${formatYmdDisplay(toYmd)}`;
  }
  if (fromYmd) return `${formatYmdDisplay(fromYmd)} – …`;
  return `… – ${formatYmdDisplay(toYmd)}`;
}

/** Format a UTC instant as `YYYY-MM-DDTHH:mm` in Argentina (for datetime pickers). */
export function toArgentinaDatetimeLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}
