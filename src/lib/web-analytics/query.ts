import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { ActivityPeriod } from "@/lib/admin-analytics-shared";
import { getWebAnalyticsEnv } from "@/lib/web-analytics/env";
import {
  formatDeviceLabel,
  formatProductPathLabel,
  formatReferrerLabel,
  getWebAnalyticsDateRange,
} from "@/lib/web-analytics/format";
import type {
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
    topProductPages: [],
    topPages: [],
    topReferrers: [],
    devices: [],
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
    const [countJson, pathsJson, productsJson, referrersJson, devicesJson] =
      await Promise.all([
        vercelGet("/visits/count", baseParams, env.token),
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

    const pathData =
      pathsJson &&
      typeof pathsJson === "object" &&
      "data" in pathsJson &&
      Array.isArray(pathsJson.data)
        ? (pathsJson.data as AggregateRow[])
        : [];
    const productData =
      productsJson &&
      typeof productsJson === "object" &&
      "data" in productsJson &&
      Array.isArray(productsJson.data)
        ? (productsJson.data as AggregateRow[])
        : [];
    const referrerData =
      referrersJson &&
      typeof referrersJson === "object" &&
      "data" in referrersJson &&
      Array.isArray(referrersJson.data)
        ? (referrersJson.data as AggregateRow[])
        : [];
    const deviceData =
      devicesJson &&
      typeof devicesJson === "object" &&
      "data" in devicesJson &&
      Array.isArray(devicesJson.data)
        ? (devicesJson.data as AggregateRow[])
        : [];

    const topPages = parsePathRows(pathData, "requestPath");
    const topProductPages = parsePathRows(productData, "requestPath");
    const topReferrers = parseNamedRows(
      referrerData,
      "referrerHostname",
      formatReferrerLabel,
    );
    const devices = parseNamedRows(deviceData, "deviceType", formatDeviceLabel);

    if (
      totals.visitors === 0 &&
      totals.pageviews === 0 &&
      topPages.length === 0
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
      topProductPages,
      topPages,
      topReferrers,
      devices,
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
    ["web-analytics-report", period, projectId],
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
