export type WebTrafficPeriod = "24h" | "7d" | "30d";

export type WebTrafficSeriesGranularity = "hour" | "day";

export const WEB_TRAFFIC_PERIODS: WebTrafficPeriod[] = ["24h", "7d", "30d"];

export const WEB_TRAFFIC_PERIOD_LABELS: Record<
  WebTrafficPeriod,
  { short: string; summary: string }
> = {
  "24h": { short: "24 h", summary: "últimas 24 horas" },
  "7d": { short: "7 días", summary: "últimos 7 días" },
  "30d": { short: "30 días", summary: "últimos 30 días" },
};

export function parseWebTrafficPeriod(value?: string): WebTrafficPeriod {
  if (value === "24h" || value === "30d") return value;
  return "7d";
}
