import { AdminAnalyticsFunnel } from "@/components/admin/admin-analytics-funnel";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminCardSection,
  AdminDetailField,
  AdminDetailGrid,
} from "@/components/admin/admin-surface";
import type {
  AnalyticsCustomerCohort,
  AnalyticsPeriodMetrics,
} from "@/lib/advanced-analytics";

type AdminAnalyticsInsightsGridProps = {
  metrics: AnalyticsPeriodMetrics;
  cohort: AnalyticsCustomerCohort;
};

function formatRate(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function AdminAnalyticsInsightsGrid({
  metrics,
  cohort,
}: AdminAnalyticsInsightsGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminAnalyticsFunnel metrics={metrics} />

      <AdminCard
        title="Clientes del período"
        description="Compradores únicos con al menos un pedido pagado."
      >
        <AdminCardSection>
          <AdminDetailGrid>
            <AdminDetailField label="Clientes únicos">
              {cohort.uniqueCustomers}
            </AdminDetailField>
            <AdminDetailField label="Nuevos">
              {cohort.newCustomers}
            </AdminDetailField>
            <AdminDetailField label="Recurrentes">
              {cohort.returningCustomers}
            </AdminDetailField>
            <AdminDetailField label="Tasa de recompra">
              {formatRate(cohort.repeatRate)}
            </AdminDetailField>
          </AdminDetailGrid>
        </AdminCardSection>
      </AdminCard>
    </div>
  );
}
