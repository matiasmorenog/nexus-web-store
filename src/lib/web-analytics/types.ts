export type WebAnalyticsTotals = {
  visitors: number;
  pageviews: number;
};

export type WebAnalyticsPathRow = {
  path: string;
  label: string;
  visitors: number;
  pageviews: number;
};

export type WebAnalyticsNamedRow = {
  key: string;
  label: string;
  visitors: number;
  pageviews: number;
};

export type WebAnalyticsDayPoint = {
  /** Series key: `YYYY-MM-DD` (day) or ISO hour stamp */
  date: string;
  label: string;
  visitors: number;
  pageviews: number;
};

export type WebAnalyticsReportStatus =
  | "ok"
  | "unconfigured"
  | "empty"
  | "error";

export type WebAnalyticsReport = {
  status: WebAnalyticsReportStatus;
  message?: string;
  since: string;
  until: string;
  totals: WebAnalyticsTotals;
  /** Hourly (24h) or daily (7d/30d) pageview series */
  series: WebAnalyticsDayPoint[];
  seriesBy: "hour" | "day";
  topProductPages: WebAnalyticsPathRow[];
  topPages: WebAnalyticsPathRow[];
  topReferrers: WebAnalyticsNamedRow[];
  devices: WebAnalyticsNamedRow[];
  countries: WebAnalyticsNamedRow[];
  browsers: WebAnalyticsNamedRow[];
  operatingSystems: WebAnalyticsNamedRow[];
  /** True when the query window was clamped to the Vercel Hobby reporting limit. */
  clampedToHobbyWindow?: boolean;
};
