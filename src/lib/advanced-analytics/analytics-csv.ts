import type { TopProduct } from "@/lib/admin-analytics-shared";
import type {
  AdvancedAnalyticsReport,
  AnalyticsCategoryRank,
} from "@/lib/advanced-analytics/types";
import { formatPercentChange } from "@/lib/advanced-analytics/format";
import { toCsvContent, toCsvRow } from "@/lib/exports/csv";

function formatRate(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function buildAnalyticsReportCsv(
  report: AdvancedAnalyticsReport,
  topProducts: TopProduct[],
): string {
  const { comparison, cohort, loyalCustomers, topCategories, period } = report;
  const { current, previous } = comparison;
  const rows: string[] = [];

  rows.push(toCsvRow(["Sección", "Métrica", "Valor"]));
  rows.push(toCsvRow(["meta", "period", period]));

  rows.push(toCsvRow(["comparacion", "ingresos_actual", current.revenue]));
  rows.push(toCsvRow(["comparacion", "ingresos_anterior", previous.revenue]));
  rows.push(
    toCsvRow([
      "comparacion",
      "ingresos_cambio_pct",
      formatPercentChange(comparison.revenueChangePct),
    ]),
  );
  rows.push(toCsvRow(["comparacion", "pedidos_actual", current.orders]));
  rows.push(toCsvRow(["comparacion", "pedidos_anterior", previous.orders]));
  rows.push(
    toCsvRow([
      "comparacion",
      "pedidos_cambio_pct",
      formatPercentChange(comparison.ordersChangePct),
    ]),
  );
  rows.push(toCsvRow(["comparacion", "pagados_actual", current.paidOrders]));
  rows.push(toCsvRow(["comparacion", "pagados_anterior", previous.paidOrders]));
  rows.push(
    toCsvRow([
      "comparacion",
      "pagados_cambio_pct",
      formatPercentChange(comparison.paidOrdersChangePct),
    ]),
  );
  rows.push(
    toCsvRow(["comparacion", "aov_actual", current.averageOrderValue]),
  );
  rows.push(
    toCsvRow(["comparacion", "aov_anterior", previous.averageOrderValue]),
  );
  rows.push(
    toCsvRow([
      "comparacion",
      "aov_cambio_pct",
      formatPercentChange(comparison.aovChangePct),
    ]),
  );
  rows.push(
    toCsvRow(["embudo", "conversion_pct", formatRate(current.conversionRate)]),
  );
  rows.push(toCsvRow(["embudo", "cancelados", current.cancelledOrders]));

  rows.push(toCsvRow(["cohort", "unicos", cohort.uniqueCustomers]));
  rows.push(toCsvRow(["cohort", "nuevos", cohort.newCustomers]));
  rows.push(toCsvRow(["cohort", "recurrentes", cohort.returningCustomers]));
  rows.push(toCsvRow(["cohort", "recompra_pct", formatRate(cohort.repeatRate)]));

  rows.push("");
  rows.push(
    toCsvRow([
      "cliente_fiel_email",
      "nombre",
      "pedidos",
      "ingresos",
      "ultima_compra",
    ]),
  );
  for (const customer of loyalCustomers) {
    rows.push(
      toCsvRow([
        customer.email,
        customer.name,
        customer.orderCount,
        customer.revenue,
        customer.lastOrderAt,
      ]),
    );
  }

  rows.push("");
  rows.push(toCsvRow(["top_producto_id", "nombre", "unidades", "ingresos"]));
  for (const product of topProducts) {
    rows.push(
      toCsvRow([
        product.productId,
        product.name,
        product.quantity,
        product.revenue,
      ]),
    );
  }

  rows.push("");
  rows.push(toCsvRow(["top_categoria", "unidades", "ingresos"]));
  for (const category of topCategories as AnalyticsCategoryRank[]) {
    rows.push(
      toCsvRow([category.category, category.quantity, category.revenue]),
    );
  }

  return toCsvContent(rows);
}
