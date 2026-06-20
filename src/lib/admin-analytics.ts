import { db } from "@/lib/db";

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

const SALE_STATUSES = ["PAID", "SHIPPED"] as const;

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

const MONTH_WEEK_CHUNK_SIZES = [7, 7, 8, 8] as const;

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

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthRangeFromKey(key: string): { desde: string; hasta: string } {
  const [year, month] = key.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return {
    desde: `${key}-01`,
    hasta: `${key}-${String(lastDay).padStart(2, "0")}`,
  };
}

function buildBuckets(period: ActivityPeriod): {
  buckets: ActivityPoint[];
  rangeStart: Date;
} {
  const today = startOfDay(new Date());

  if (period === "week") {
    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - 6);

    const buckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(rangeStart);
      date.setDate(rangeStart.getDate() + index);

      return {
        key: isoDate(date),
        label: date
          .toLocaleDateString("es-AR", { weekday: "short" })
          .replace(".", ""),
        orders: 0,
        revenue: 0,
        desde: isoDate(date),
        hasta: isoDate(date),
      };
    });

    return { buckets, rangeStart };
  }

  if (period === "month") {
    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - 29);

    const buckets = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(rangeStart);
      date.setDate(rangeStart.getDate() + index);

      const dayKey = isoDate(date);

      return {
        key: dayKey,
        label: String(date.getDate()),
        orders: 0,
        revenue: 0,
        desde: dayKey,
        hasta: dayKey,
      };
    });

    return { buckets, rangeStart };
  }

  const rangeStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);

  const buckets = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const range = monthRangeFromKey(key);

    return {
      key,
      label: date.toLocaleDateString("es-AR", { month: "short" }).replace(".", ""),
      orders: 0,
      revenue: 0,
      desde: range.desde,
      hasta: range.hasta,
    };
  });

  return { buckets, rangeStart };
}

function bucketKeyForOrder(date: Date, period: ActivityPeriod): string {
  if (period === "year") {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return startOfDay(date).toISOString().slice(0, 10);
}

export async function getSalesActivity(storeId: string, period: ActivityPeriod) {
  const { buckets, rangeStart } = buildBuckets(period);

  const ordersInRange = await db.order.findMany({
    where: {
      storeId,
      status: { in: [...SALE_STATUSES] },
      createdAt: { gte: rangeStart },
    },
    select: {
      createdAt: true,
      total: true,
    },
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const order of ordersInRange) {
    const key = bucketKeyForOrder(order.createdAt, period);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.revenue += Number(order.total);
  }

  const totalOrders = buckets.reduce((sum, bucket) => sum + bucket.orders, 0);
  const totalRevenue = buckets.reduce((sum, bucket) => sum + bucket.revenue, 0);

  return {
    period,
    points: buckets,
    totalOrders,
    totalRevenue,
  };
}

async function getTopProducts(storeId: string) {
  const soldItems = await db.orderItem.findMany({
    where: {
      order: {
        storeId,
        status: { in: [...SALE_STATUSES] },
      },
    },
    select: {
      quantity: true,
      unitPrice: true,
      variant: {
        select: {
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  const productTotals = new Map<
    string,
    { productId: string; name: string; quantity: number; revenue: number }
  >();

  for (const item of soldItems) {
    const product = item.variant.product;
    const quantity = item.quantity;
    const revenue = quantity * Number(item.unitPrice);
    const existing = productTotals.get(product.id);

    if (existing) {
      existing.quantity += quantity;
      existing.revenue += revenue;
    } else {
      productTotals.set(product.id, {
        productId: product.id,
        name: product.name,
        quantity,
        revenue,
      });
    }
  }

  return [...productTotals.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

export async function getDashboardAnalytics(
  storeId: string,
  period: ActivityPeriod = "week",
) {
  const [salesActivity, topProducts] = await Promise.all([
    getSalesActivity(storeId, period),
    getTopProducts(storeId),
  ]);

  return {
    salesActivity,
    topProducts,
  };
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
