export type ActivityPeriod = "week" | "month" | "year";

/** Dashboard chart/top: calendar month (current MTD or previous full month). */
export type DashboardMonthPeriod = "current" | "previous";

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
  /** Sin Access Token de Mercado Pago guardado en admin (plan base). */
  cobrosTokenMissing: boolean;
  /** Módulo shippingCarriers activo sin token en admin (ME ni MP vía Cobros). */
  shippingCarriersTokenMissing: boolean;
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

export function parseActivityPeriod(value?: string): ActivityPeriod {
  if (value === "month" || value === "year") return value;
  return "week";
}

export function parseDashboardMonthPeriod(
  value?: string,
): DashboardMonthPeriod {
  if (value === "previous") return "previous";
  return "current";
}

export function getDashboardMonthPeriodMeta(
  period: DashboardMonthPeriod,
  now = new Date(),
): {
  short: string;
  summary: string;
  description: string;
  empty: string;
  monthLabel: string;
} {
  const ref =
    period === "current"
      ? now
      : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthLabel = ref.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  const capitalized =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  if (period === "current") {
    return {
      short: "Este mes",
      summary: capitalized,
      description: `Ingresos de pedidos pagados y enviados por día (${capitalized}, mes en curso)`,
      empty: `Sin ventas en ${capitalized}.`,
      monthLabel: capitalized,
    };
  }

  return {
    short: "Mes anterior",
    summary: capitalized,
    description: `Ingresos de pedidos pagados y enviados por día (${capitalized}, mes completo)`,
    empty: `Sin ventas en ${capitalized}.`,
    monthLabel: capitalized,
  };
}

/** Agrupa un mes (28–31 días o rolling 30) en ~4 semanas (vista mobile). */
export function aggregateActivityIntoWeeks(points: ActivityPoint[]): ActivityPoint[] {
  if (points.length === 0) return [];

  const weekCount = Math.min(4, points.length);
  const baseSize = Math.floor(points.length / weekCount);
  const remainder = points.length % weekCount;
  const weeks: ActivityPoint[] = [];
  let start = 0;

  for (let index = 0; index < weekCount; index++) {
    const size = baseSize + (index < remainder ? 1 : 0);
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
  return "/admin/modulos/cobros";
}

export function buildAdminShippingCarriersHref() {
  return "/admin/modulos/shippingCarriers";
}

function isoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Max lookback when expanding dashboard recent orders into /admin/pedidos. */
export const DASHBOARD_RECENT_ORDERS_LOOKBACK_DAYS = 14;

/**
 * Bounded date range for "Ver más" from dashboard recent orders:
 * from the oldest of the listed orders (capped at 14 days) through today.
 */
export function buildAdminRecentOrdersListHref(
  orders: Pick<DashboardRecentOrder, "createdAt">[],
  now = new Date(),
): string {
  const today = startOfLocalDay(now);
  const hasta = isoDateLocal(today);
  const floor = new Date(today);
  floor.setDate(floor.getDate() - (DASHBOARD_RECENT_ORDERS_LOOKBACK_DAYS - 1));

  let oldest = today;
  for (const order of orders) {
    const created = startOfLocalDay(new Date(order.createdAt));
    if (created < oldest) oldest = created;
  }

  const desdeDate = oldest < floor ? floor : oldest;
  const params = new URLSearchParams({
    desde: isoDateLocal(desdeDate),
    hasta,
  });

  return `/admin/pedidos?${params.toString()}`;
}

export function buildAdminOrderHref(
  orderId: string,
  createdAt?: string,
) {
  const params = new URLSearchParams();

  if (createdAt) {
    const day = isoDateLocal(startOfLocalDay(new Date(createdAt)));
    params.set("desde", day);
    params.set("hasta", day);
  } else {
    params.set("todos", "1");
  }

  return `/admin/pedidos?${params.toString()}#pedido-${orderId}`;
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
