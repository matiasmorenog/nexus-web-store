import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getWebAnalyticsEnv } from "@/lib/web-analytics/env";
import {
  formatCountryLabel,
  formatDayLabel,
  formatDeviceLabel,
  formatHourLabel,
  formatProductPathLabel,
  formatReferrerLabel,
  formatTechLabel,
  getWebAnalyticsDateRange,
} from "@/lib/web-analytics/format";
import type {
  WebTrafficPeriod,
  WebTrafficSeriesGranularity,
} from "@/lib/web-analytics/period";
import type {
  WebAnalyticsDayPoint,
  WebAnalyticsNamedRow,
  WebAnalyticsPathRow,
  WebAnalyticsReport,
  WebAnalyticsTotals,
} from "@/lib/web-analytics/types";

const API_BASE = "https://api.vercel.com/v1/query/web-analytics";
const CACHE_TTL_SECONDS = 60;
const TOP_LIMIT = 8;

type AggregateRow = Record<string, unknown>;

function emptyTotals(): WebAnalyticsTotals {
  return { visitors: 0, pageviews: 0 };
}

function emptyReport(
  partial: Pick<WebAnalyticsReport, "status" | "message" | "since" | "until"> & {
    clampedToHobbyWindow?: boolean;
    seriesBy?: WebTrafficSeriesGranularity;
  },
): WebAnalyticsReport {
  return {
    ...partial,
    totals: emptyTotals(),
    series: [],
    seriesBy: partial.seriesBy ?? "day",
    topProductPages: [],
    topReferrers: [],
    devices: [],
    countries: [],
    browsers: [],
    operatingSystems: [],
  };
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

/**
 * `visits/count` floors since/until to UTC day starts; `until` is exclusive.
 * Passing `until=now` becomes today 00:00 UTC and drops today's traffic.
 * Bump to next UTC midnight so the current day is included.
 */
function countExclusiveUntil(until: Date): string {
  return new Date(
    Date.UTC(
      until.getUTCFullYear(),
      until.getUTCMonth(),
      until.getUTCDate() + 1,
    ),
  ).toISOString();
}

function sumSeriesPageviews(points: WebAnalyticsDayPoint[]): number {
  return points.reduce((sum, point) => sum + point.pageviews, 0);
}

async function vercelGet(
  path: string,
  params: Record<string, string | number | undefined>,
  token: string,
): Promise<unknown> {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Vercel Web Analytics ${response.status}: ${body.slice(0, 240) || response.statusText}`,
    );
  }

  return response.json();
}

function aggregateRows(json: unknown): AggregateRow[] {
  if (
    json &&
    typeof json === "object" &&
    "data" in json &&
    Array.isArray(json.data)
  ) {
    return json.data as AggregateRow[];
  }
  return [];
}

function parsePathRows(
  rows: AggregateRow[],
  dimension: "requestPath" | "route",
): WebAnalyticsPathRow[] {
  return rows
    .map((row) => {
      const path = asString(row[dimension]);
      if (!path || path === "Others") return null;
      return {
        path,
        label: formatProductPathLabel(path),
        visitors: asNumber(row.visitors),
        pageviews: asNumber(row.pageviews),
      };
    })
    .filter((row): row is WebAnalyticsPathRow => row != null)
    .sort((a, b) => b.pageviews - a.pageviews || b.visitors - a.visitors);
}

function parseNamedRows(
  rows: AggregateRow[],
  dimension: string,
  labelFn: (raw: string) => string,
): WebAnalyticsNamedRow[] {
  return rows
    .map((row) => {
      const key = asString(row[dimension]);
      if (key === "Others") return null;
      return {
        key: key || "unknown",
        label: labelFn(key),
        visitors: asNumber(row.visitors),
        pageviews: asNumber(row.pageviews),
      };
    })
    .filter((row): row is WebAnalyticsNamedRow => row != null)
    .sort((a, b) => b.visitors - a.visitors || b.pageviews - a.pageviews);
}

function parseSeriesRows(
  rows: AggregateRow[],
  seriesBy: WebTrafficSeriesGranularity,
): WebAnalyticsDayPoint[] {
  const byKey = new Map<string, WebAnalyticsDayPoint>();

  for (const row of rows) {
    const stamp = asString(row.timestamp || row.day || row.hour);
    if (!stamp) continue;

    if (seriesBy === "hour") {
      const date = new Date(stamp);
      if (Number.isNaN(date.getTime())) continue;
      date.setUTCMinutes(0, 0, 0);
      const key = date.toISOString();
      byKey.set(key, {
        date: key,
        label: formatHourLabel(key),
        visitors: asNumber(row.visitors),
        pageviews: asNumber(row.pageviews),
      });
      continue;
    }

    const day = stamp.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    byKey.set(day, {
      date: day,
      label: formatDayLabel(day),
      visitors: asNumber(row.visitors),
      pageviews: asNumber(row.pageviews),
    });
  }

  return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchWebAnalyticsReport(
  period: WebTrafficPeriod,
): Promise<WebAnalyticsReport> {
  const env = getWebAnalyticsEnv();
  const { since, until, clampedToHobbyWindow, seriesBy } =
    getWebAnalyticsDateRange(period);
  const sinceIso = since.toISOString();
  const untilIso = until.toISOString();

  if (!env) {
    return emptyReport({
      status: "unconfigured",
      message:
        "Configurá VERCEL_WEB_ANALYTICS_TOKEN y VERCEL_PROJECT_ID para ver el tráfico del sitio.",
      since: sinceIso,
      until: untilIso,
      clampedToHobbyWindow,
      seriesBy,
    });
  }

  const baseParams = {
    projectId: env.projectId,
    teamId: env.teamId ?? undefined,
    since: sinceIso,
    until: untilIso,
  };
  // Count is day-grained; exclusive until must be next UTC midnight.
  const countParams = {
    projectId: env.projectId,
    teamId: env.teamId ?? undefined,
    since: sinceIso,
    until: countExclusiveUntil(until),
  };

  try {
    // External HTTP — parallel OK (not Neon pooler).
    // No UTM dims: require Vercel Analytics Plus (not on Hobby).
    const seriesLimit = seriesBy === "hour" ? 28 : 32;
    const [
      countJson,
      seriesJson,
      productsJson,
      referrersJson,
      devicesJson,
      countriesJson,
      browsersJson,
      osJson,
    ] = await Promise.all([
      vercelGet("/visits/count", countParams, env.token),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: seriesBy,
          limit: seriesLimit,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "requestPath",
          limit: TOP_LIMIT,
          filter:
            "startswith(requestPath,'/producto/') or startswith(requestPath,'/prodotto/')",
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "referrerHostname",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "deviceType",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "country",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "browserName",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "osName",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
    ]);

    const countData =
      countJson &&
      typeof countJson === "object" &&
      "data" in countJson &&
      countJson.data &&
      typeof countJson.data === "object"
        ? (countJson.data as Record<string, unknown>)
        : {};

    const series = parseSeriesRows(aggregateRows(seriesJson), seriesBy);
    const seriesPageviews = sumSeriesPageviews(series);
    // Prefer count visitors (unique). Pageviews: count when non-zero, else
    // series sum (guards day-truncation / empty count edge cases).
    const countPageviews = asNumber(countData.pageviews);
    const totals: WebAnalyticsTotals = {
      visitors: asNumber(countData.visitors),
      pageviews: countPageviews > 0 ? countPageviews : seriesPageviews,
    };
    const topProductPages = parsePathRows(
      aggregateRows(productsJson),
      "requestPath",
    );
    const topReferrers = parseNamedRows(
      aggregateRows(referrersJson),
      "referrerHostname",
      formatReferrerLabel,
    );
    const devices = parseNamedRows(
      aggregateRows(devicesJson),
      "deviceType",
      formatDeviceLabel,
    );
    const countries = parseNamedRows(
      aggregateRows(countriesJson),
      "country",
      formatCountryLabel,
    );
    const browsers = parseNamedRows(
      aggregateRows(browsersJson),
      "browserName",
      formatTechLabel,
    );
    const operatingSystems = parseNamedRows(
      aggregateRows(osJson),
      "osName",
      formatTechLabel,
    );

    if (
      totals.visitors === 0 &&
      totals.pageviews === 0 &&
      topProductPages.length === 0 &&
      series.length === 0
    ) {
      return emptyReport({
        status: "empty",
        message:
          "Todavía no hay visitas registradas en este período. Las visitas nuevas aparecen tras el deploy con Web Analytics activo.",
        since: sinceIso,
        until: untilIso,
        clampedToHobbyWindow,
        seriesBy,
      });
    }

    return {
      status: "ok",
      since: sinceIso,
      until: untilIso,
      totals,
      series,
      seriesBy,
      topProductPages,
      topReferrers,
      devices,
      countries,
      browsers,
      operatingSystems,
      clampedToHobbyWindow,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al consultar Web Analytics";
    console.error("[web-analytics]", message);
    return emptyReport({
      status: "error",
      message:
        "No se pudo cargar el tráfico del sitio. Revisá el token de Vercel y que Web Analytics esté activo en el proyecto.",
      since: sinceIso,
      until: untilIso,
      clampedToHobbyWindow,
      seriesBy,
    });
  }
}

function getCachedWebAnalyticsReport(
  period: WebTrafficPeriod,
  projectId: string,
) {
  return unstable_cache(
    () => fetchWebAnalyticsReport(period),
    ["web-analytics-report", period, projectId, "v6-count-until"],
    { revalidate: CACHE_TTL_SECONDS },
  )();
}

export const getWebAnalyticsReport = cache(
  async (period: WebTrafficPeriod = "7d"): Promise<WebAnalyticsReport> => {
    const env = getWebAnalyticsEnv();
    if (!env) {
      const { since, until, clampedToHobbyWindow, seriesBy } =
        getWebAnalyticsDateRange(period);
      return emptyReport({
        status: "unconfigured",
        message:
          "Configurá VERCEL_WEB_ANALYTICS_TOKEN y VERCEL_PROJECT_ID para ver el tráfico del sitio.",
        since: since.toISOString(),
        until: until.toISOString(),
        clampedToHobbyWindow,
        seriesBy,
      });
    }
    return getCachedWebAnalyticsReport(period, env.projectId);
  },
);
