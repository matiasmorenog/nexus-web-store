import { Suspense } from "react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminSkeletonTabs } from "@/components/admin/admin-skeleton";
import { AdminWebTrafficDailyChart } from "@/components/admin/admin-web-traffic-daily-chart";
import { AdminWebTrafficPeriodTabs } from "@/components/admin/admin-web-traffic-period-tabs";
import type {
  WebAnalyticsNamedRow,
  WebAnalyticsPathRow,
  WebAnalyticsReport,
} from "@/lib/web-analytics";
import {
  WEB_TRAFFIC_PERIOD_LABELS,
  type WebTrafficPeriod,
} from "@/lib/web-analytics/period";
import { cn } from "@/lib/utils";

type AdminWebTrafficSectionProps = {
  period: WebTrafficPeriod;
  report: WebAnalyticsReport;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <AdminCard title={label} className="h-full">
      <p className="text-3xl font-bold tracking-tight text-neutral-900">
        {value}
      </p>
    </AdminCard>
  );
}

function RankList({
  rows,
  empty,
  valueKey = "pageviews",
}: {
  rows: Array<WebAnalyticsPathRow | WebAnalyticsNamedRow>;
  empty: string;
  valueKey?: "pageviews" | "visitors";
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-neutral-500">{empty}</p>;
  }

  const max = Math.max(...rows.map((row) => row[valueKey]), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row, index) => {
        const value = row[valueKey];
        const width = Math.max(8, Math.round((value / max) * 100));
        const title = "path" in row ? row.label : row.label;
        const subtitle = "path" in row ? row.path : null;

        return (
          <li key={`${title}-${index}`}>
            <div className="mb-1.5 flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium capitalize text-neutral-900">
                  <span className="mr-2 tabular-nums text-neutral-400">
                    {index + 1}.
                  </span>
                  {title}
                </p>
                {subtitle && subtitle !== title ? (
                  <p className="truncate text-xs text-neutral-500">{subtitle}</p>
                ) : null}
              </div>
              <div className="shrink-0 text-right tabular-nums text-neutral-700">
                <p className="font-medium">{formatCount(value)}</p>
                <p className="text-xs text-neutral-500">
                  {formatCount(row.visitors)} visit.
                </p>
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className={cn("h-full rounded-full bg-[var(--brand-primary)]")}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminWebTrafficSection({
  period,
  report,
}: AdminWebTrafficSectionProps) {
  const periodLabel = WEB_TRAFFIC_PERIOD_LABELS[period].summary;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Tráfico del sitio
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Visitas reales del storefront ({periodLabel}
            {report.clampedToHobbyWindow
              ? ", ventana máxima del plan Vercel"
              : ""}
            ). País, browser, OS y tendencia vía Web Analytics.
          </p>
        </div>
        <Suspense fallback={<AdminSkeletonTabs />}>
          <AdminWebTrafficPeriodTabs period={period} />
        </Suspense>
      </div>

      {report.status === "unconfigured" ||
      report.status === "error" ||
      report.status === "empty" ? (
        <AdminCard title="Tráfico web">
          <p className="text-sm text-neutral-600">
            {report.message ?? "Sin datos de tráfico."}
          </p>
        </AdminCard>
      ) : (
        <>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
            <MetricCard
              label="Visitantes"
              value={formatCount(report.totals.visitors)}
            />
            <MetricCard
              label="Vistas de página"
              value={formatCount(report.totals.pageviews)}
            />
          </div>

          <AdminCard
            title={
              report.seriesBy === "hour"
                ? "Tendencia por hora"
                : "Tendencia diaria"
            }
            description={
              report.seriesBy === "hour"
                ? "Pageviews por hora (últimas 24 h)"
                : "Pageviews por día en el período"
            }
          >
            <AdminWebTrafficDailyChart
              points={report.series}
              seriesBy={report.seriesBy}
            />
          </AdminCard>

          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AdminCard
              title="Productos más vistos"
              description="PDP con más pageviews en el período"
            >
              <RankList
                rows={report.topProductPages}
                empty="Nadie visitó fichas de producto en este período."
              />
            </AdminCard>
            <AdminCard
              title="Páginas top"
              description="Rutas con más tráfico en el storefront"
            >
              <RankList
                rows={report.topPages}
                empty="Sin páginas con visitas en este período."
              />
            </AdminCard>
            <AdminCard
              title="Dispositivos"
              description="Cómo navegan tus clientes"
            >
              <RankList
                rows={report.devices}
                empty="Sin datos de dispositivo."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              title="Países"
              description="Origen geográfico de las visitas"
            >
              <RankList
                rows={report.countries}
                empty="Sin datos de país todavía."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              title="De dónde llegan"
              description="Referrers / redes / búsqueda"
            >
              <RankList
                rows={report.topReferrers}
                empty="Sin referrers todavía."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              title="Navegadores"
              description="Browser de los visitantes"
            >
              <RankList
                rows={report.browsers}
                empty="Sin datos de browser."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              title="Sistemas operativos"
              description="OS de los visitantes"
            >
              <RankList
                rows={report.operatingSystems}
                empty="Sin datos de sistema operativo."
                valueKey="visitors"
              />
            </AdminCard>
          </div>
        </>
      )}
    </div>
  );
}
