import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { ActivityPeriod } from "@/lib/admin-analytics-shared";
import { getWebAnalyticsEnv } from "@/lib/web-analytics/env";
import {
  formatCountryLabel,
  formatDayLabel,
  formatDeviceLabel,
  formatProductPathLabel,
  formatReferrerLabel,
  formatTechLabel,
  formatUtmLabel,
  getWebAnalyticsDateRange,
  WEB_ANALYTICS_HOBBY_MAX_DAYS,
} from "@/lib/web-analytics/format";
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
  },
): WebAnalyticsReport {
  return {
    ...partial,
    totals: emptyTotals(),
    daily: [],
    topProductPages: [],
    topPages: [],
    topReferrers: [],
    devices: [],
    countries: [],
    browsers: [],
    operatingSystems: [],
    utmSources: [],
    utmMediums: [],
    utmCampaigns: [],
  };
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
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

function parseDailyRows(rows: AggregateRow[]): WebAnalyticsDayPoint[] {
  const byDate = new Map<string, WebAnalyticsDayPoint>();

  for (const row of rows) {
    const stamp = asString(row.timestamp || row.day);
    if (!stamp) continue;
    const date = stamp.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    byDate.set(date, {
      date,
      label: formatDayLabel(date),
      visitors: asNumber(row.visitors),
      pageviews: asNumber(row.pageviews),
    });
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchWebAnalyticsReport(
  period: ActivityPeriod,
): Promise<WebAnalyticsReport> {
  const env = getWebAnalyticsEnv();
  const { since, until, clampedToHobbyWindow } =
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
    });
  }

  const baseParams = {
    projectId: env.projectId,
    teamId: env.teamId ?? undefined,
    since: sinceIso,
    until: untilIso,
  };

  try {
    // External HTTP — parallel OK (not Neon pooler).
    const [
      countJson,
      dailyJson,
      pathsJson,
      productsJson,
      referrersJson,
      devicesJson,
      countriesJson,
      browsersJson,
      osJson,
      utmSourceJson,
      utmMediumJson,
      utmCampaignJson,
    ] = await Promise.all([
      vercelGet("/visits/count", baseParams, env.token),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "day",
          limit: WEB_ANALYTICS_HOBBY_MAX_DAYS + 2,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "requestPath",
          limit: TOP_LIMIT,
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
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "utmSource",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "utmMedium",
          limit: TOP_LIMIT,
        },
        env.token,
      ),
      vercelGet(
        "/visits/aggregate",
        {
          ...baseParams,
          by: "utmCampaign",
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

    const totals: WebAnalyticsTotals = {
      visitors: asNumber(countData.visitors),
      pageviews: asNumber(countData.pageviews),
    };

    const daily = parseDailyRows(aggregateRows(dailyJson));
    const topPages = parsePathRows(aggregateRows(pathsJson), "requestPath");
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
    const utmSources = parseNamedRows(
      aggregateRows(utmSourceJson),
      "utmSource",
      formatUtmLabel,
    );
    const utmMediums = parseNamedRows(
      aggregateRows(utmMediumJson),
      "utmMedium",
      formatUtmLabel,
    );
    const utmCampaigns = parseNamedRows(
      aggregateRows(utmCampaignJson),
      "utmCampaign",
      formatUtmLabel,
    );

    if (
      totals.visitors === 0 &&
      totals.pageviews === 0 &&
      topPages.length === 0 &&
      daily.length === 0
    ) {
      return emptyReport({
        status: "empty",
        message:
          "Todavía no hay visitas registradas en este período. Las visitas nuevas aparecen tras el deploy con Web Analytics activo.",
        since: sinceIso,
        until: untilIso,
        clampedToHobbyWindow,
      });
    }

    return {
      status: "ok",
      since: sinceIso,
      until: untilIso,
      totals,
      daily,
      topProductPages,
      topPages,
      topReferrers,
      devices,
      countries,
      browsers,
      operatingSystems,
      utmSources,
      utmMediums,
      utmCampaigns,
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
    });
  }
}

function getCachedWebAnalyticsReport(period: ActivityPeriod, projectId: string) {
  return unstable_cache(
    () => fetchWebAnalyticsReport(period),
    ["web-analytics-report", period, projectId, "v2-dimensions"],
    { revalidate: CACHE_TTL_SECONDS },
  )();
}

export const getWebAnalyticsReport = cache(
  async (period: ActivityPeriod = "week"): Promise<WebAnalyticsReport> => {
    const env = getWebAnalyticsEnv();
    if (!env) {
      const { since, until, clampedToHobbyWindow } =
        getWebAnalyticsDateRange(period);
      return emptyReport({
        status: "unconfigured",
        message:
          "Configurá VERCEL_WEB_ANALYTICS_TOKEN y VERCEL_PROJECT_ID para ver el tráfico del sitio.",
        since: since.toISOString(),
        until: until.toISOString(),
        clampedToHobbyWindow,
      });
    }
    return getCachedWebAnalyticsReport(period, env.projectId);
  },
);
