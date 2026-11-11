import { Suspense } from "react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminSkeletonTabs } from "@/components/admin/admin-skeleton";
import { AdminWebTrafficDailyChart } from "@/components/admin/admin-web-traffic-daily-chart";
import { AdminWebTrafficPeriodTabs } from "@/components/admin/admin-web-traffic-period-tabs";
import { AdminWebTrafficRankList } from "@/components/admin/admin-web-traffic-rank-list";
import type { WebAnalyticsReport } from "@/lib/web-analytics";
import {
  WEB_TRAFFIC_PERIOD_LABELS,
  type WebTrafficPeriod,
} from "@/lib/web-analytics/period";

type AdminWebTrafficSectionProps = {
  period: WebTrafficPeriod;
  report: WebAnalyticsReport;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("es-AR").format(value);
}

function MetricCard({
  label,
  description,
  value,
}: {
  label: string;
  description: string;
  value: string;
}) {
  return (
    <AdminCard title={label} description={description} className="h-full">
      <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">
        {value}
      </p>
    </AdminCard>
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
        <div className="select-none">
          <h2 className="text-lg font-semibold text-neutral-900">
            Tráfico del sitio
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Visitas reales de tu tienda ({periodLabel}
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
          <div className="grid items-stretch gap-4 lg:grid-cols-[1.4fr_1fr]">
            <AdminCard
              className="h-full overflow-visible"
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

            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <MetricCard
                label="Visitantes"
                description="Personas únicas que entraron al sitio en el período"
                value={formatCount(report.totals.visitors)}
              />
              <MetricCard
                label="Vistas de página"
                description="Cantidad total de páginas vistas (una persona puede sumar varias)"
                value={formatCount(report.totals.pageviews)}
              />
            </div>
          </div>

          {/* CSS columns = masonry: short cards stack under tall neighbors (no row gaps). */}
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            <AdminCard
              className="mb-6 break-inside-avoid"
              title="Productos más vistos"
              description="PDP con más pageviews en el período"
            >
              <AdminWebTrafficRankList
                rows={report.topProductPages}
                empty="Nadie visitó fichas de producto en este período."
                linkPaths
              />
            </AdminCard>
            <AdminCard
              className="mb-6 break-inside-avoid"
              title="Dispositivos"
              description="Cómo navegan tus clientes"
            >
              <AdminWebTrafficRankList
                rows={report.devices}
                empty="Sin datos de dispositivo."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              className="mb-6 break-inside-avoid"
              title="Países"
              description="Origen geográfico de las visitas"
            >
              <AdminWebTrafficRankList
                rows={report.countries}
                empty="Sin datos de país todavía."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              className="mb-6 break-inside-avoid"
              title="De dónde llegan"
              description="Referrers / redes / búsqueda"
            >
              <AdminWebTrafficRankList
                rows={report.topReferrers}
                empty="Sin referrers todavía."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              className="mb-6 break-inside-avoid"
              title="Navegadores"
              description="Browser de los visitantes"
            >
              <AdminWebTrafficRankList
                rows={report.browsers}
                empty="Sin datos de browser."
                valueKey="visitors"
              />
            </AdminCard>
            <AdminCard
              className="mb-6 break-inside-avoid"
              title="Sistemas operativos"
              description="OS de los visitantes"
            >
              <AdminWebTrafficRankList
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
