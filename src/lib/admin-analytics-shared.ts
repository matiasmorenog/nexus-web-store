export type ActivityPeriod = "week" | "month" | "year";

export type ActivityPoint = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
  /** Rango inclusive para filtrar pedidos (YYYY-MM-DD). */
  desde?: string;
  hasta?: string;
};

export type TopProduct = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type DashboardAttention = {
  paidAwaitingShipment: number;
  outOfStockVariants: number;
  mercadopagoConfigured: boolean;
};

export type DashboardRecentOrder = {
  id: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
};

export const ACTIVITY_PERIOD_LABELS: Record<
  ActivityPeriod,
  { short: string; summary: string; description: string; empty: string }
> = {
  week: {
    short: "Semana",
    summary: "7 días",
    description: "Ingresos de pedidos pagados y enviados por día (últimos 7 días)",
    empty: "Sin ventas en los últimos 7 días.",
  },
  month: {
    short: "Mes",
    summary: "30 días",
    description: "Ingresos de pedidos pagados y enviados por día (últimos 30 días)",
    empty: "Sin ventas en los últimos 30 días.",
  },
  year: {
    short: "Año",
    summary: "12 meses",
    description: "Ingresos de pedidos pagados y enviados por mes (últimos 12 meses)",
    empty: "Sin ventas en los últimos 12 meses.",
  },
};

const MONTH_WEEK_CHUNK_SIZES = [7, 7, 8, 8] as const;

export function parseActivityPeriod(value?: string): ActivityPeriod {
  if (value === "month" || value === "year") return value;
  return "week";
}

/** Agrupa los 30 días del período mensual en 4 semanas (vista mobile). */
export function aggregateActivityIntoWeeks(points: ActivityPoint[]): ActivityPoint[] {
  if (points.length === 0) return [];

  const weeks: ActivityPoint[] = [];
  let start = 0;

  for (let index = 0; index < MONTH_WEEK_CHUNK_SIZES.length; index++) {
    const size = MONTH_WEEK_CHUNK_SIZES[index];
    const slice = points.slice(start, start + size);
    if (slice.length === 0) break;

    weeks.push({
      key: `week-${index + 1}`,
      label: `Sem ${index + 1}`,
      orders: slice.reduce((sum, point) => sum + point.orders, 0),
      revenue: slice.reduce((sum, point) => sum + point.revenue, 0),
      desde: slice[0]?.desde,
      hasta: slice[slice.length - 1]?.hasta ?? slice[slice.length - 1]?.desde,
    });

    start += size;
  }

  return weeks;
}

export function buildAdminPaidOrdersHref() {
  return "/admin/pedidos?estado=PAID&todos=1";
}

export function buildAdminOutOfStockVariantsHref() {
  return "/admin/productos?stock=sin-stock";
}

export function buildAdminPaymentSettingsHref() {
  return "/admin/configuracion";
}

export function buildAdminOrderHref(orderId: string) {
  return `/admin/pedidos?todos=1#pedido-${orderId}`;
}

export function buildAdminOrdersHrefFromActivityPoint(point: ActivityPoint) {
  if (!point.desde || point.orders <= 0) return null;

  const params = new URLSearchParams();
  params.set("desde", point.desde);

  if (point.hasta) {
    params.set("hasta", point.hasta);
  }

  return `/admin/pedidos?${params.toString()}`;
}
