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
      <AdminCard
        title="Embudo de pedidos"
        description="Del pedido creado al cobro efectivo en el período actual."
      >
        <AdminCardSection>
          <AdminDetailGrid>
            <AdminDetailField label="Pedidos creados">
              {metrics.orders}
            </AdminDetailField>
            <AdminDetailField label="Pagados / enviados">
              {metrics.paidOrders}
            </AdminDetailField>
            <AdminDetailField label="Cancelados">
              {metrics.cancelledOrders}
            </AdminDetailField>
            <AdminDetailField label="Conversión a cobro">
              {formatRate(metrics.conversionRate)}
            </AdminDetailField>
          </AdminDetailGrid>
        </AdminCardSection>
      </AdminCard>

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
