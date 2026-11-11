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
  /** UTC calendar day `YYYY-MM-DD` */
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
  daily: WebAnalyticsDayPoint[];
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
