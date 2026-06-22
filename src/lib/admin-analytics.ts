import { cache } from "react";
import { unstable_cache } from "next/cache";
import type {
  ActivityPeriod,
  ActivityPoint,
  DashboardRecentOrder,
  TopProduct,
} from "@/lib/admin-analytics-shared";
import {
  ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
  adminDashboardCacheTag,
} from "@/lib/admin-cache-tags";
import { db } from "@/lib/db";

export type {
  ActivityPeriod,
  ActivityPoint,
  DashboardAttention,
  DashboardRecentOrder,
  TopProduct,
} from "@/lib/admin-analytics-shared";

export {
  ACTIVITY_PERIOD_LABELS,
  aggregateActivityIntoWeeks,
  buildAdminOrderHref,
  buildAdminOrdersHrefFromActivityPoint,
  buildAdminOutOfStockVariantsHref,
  buildAdminPaidOrdersHref,
  parseActivityPeriod,
} from "@/lib/admin-analytics-shared";

const SALE_STATUSES = ["PAID", "SHIPPED"] as const;

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

function aggregateSalesActivity(
  ordersInRange: { createdAt: Date; total: { toString(): string } | number }[],
  buckets: ActivityPoint[],
  period: ActivityPeriod,
) {
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

function aggregateTopProducts(
  soldItems: {
    quantity: number;
    unitPrice: { toString(): string } | number;
    variant: { product: { id: string; name: string } };
  }[],
): TopProduct[] {
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

async function fetchAdminDashboardAttention(storeId: string) {
  const [paidAwaitingShipment, outOfStockVariants] = await db.$transaction([
    db.order.count({
      where: { storeId, status: "PAID" },
    }),
    db.productVariant.count({
      where: {
        product: { storeId },
        stock: { lte: 0 },
      },
    }),
  ]);

  return {
    paidAwaitingShipment,
    outOfStockVariants,
  };
}

async function fetchAdminDashboardAnalytics(
  storeId: string,
  period: ActivityPeriod,
) {
  const { buckets, rangeStart } = buildBuckets(period);

  const [ordersInRange, soldItems] = await db.$transaction([
    db.order.findMany({
      where: {
        storeId,
        status: { in: [...SALE_STATUSES] },
        createdAt: { gte: rangeStart },
      },
      select: {
        createdAt: true,
        total: true,
      },
    }),
    db.orderItem.findMany({
      where: {
        order: {
          storeId,
          status: { in: [...SALE_STATUSES] },
          createdAt: { gte: rangeStart },
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
    }),
  ]);

  return {
    salesActivity: aggregateSalesActivity(ordersInRange, buckets, period),
    topProducts: aggregateTopProducts(soldItems),
  };
}

async function fetchAdminDashboardRecentOrders(
  storeId: string,
): Promise<DashboardRecentOrder[]> {
  const orders = await db.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      customerName: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return orders.map((order) => ({
    id: order.id,
    customerName: order.customerName,
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
  }));
}

function getCachedAdminDashboardAttention(storeId: string) {
  return unstable_cache(
    () => fetchAdminDashboardAttention(storeId),
    ["admin-dashboard-attention", storeId],
    {
      revalidate: ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
      tags: [adminDashboardCacheTag(storeId)],
    },
  )();
}

function getCachedAdminDashboardAnalytics(
  storeId: string,
  period: ActivityPeriod,
) {
  return unstable_cache(
    () => fetchAdminDashboardAnalytics(storeId, period),
    ["admin-dashboard-analytics", storeId, period],
    {
      revalidate: ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
      tags: [adminDashboardCacheTag(storeId)],
    },
  )();
}

function getCachedAdminDashboardRecentOrders(storeId: string) {
  return unstable_cache(
    () => fetchAdminDashboardRecentOrders(storeId),
    ["admin-dashboard-recent-orders", storeId],
    {
      revalidate: ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
      tags: [adminDashboardCacheTag(storeId)],
    },
  )();
}

export const getAdminDashboardAttention = cache(async (storeId: string) => {
  return getCachedAdminDashboardAttention(storeId);
});

export const getAdminDashboardAnalytics = cache(
  async (storeId: string, period: ActivityPeriod = "week") => {
    return getCachedAdminDashboardAnalytics(storeId, period);
  },
);

export const getAdminDashboardRecentOrders = cache(async (storeId: string) => {
  return getCachedAdminDashboardRecentOrders(storeId);
});

export const getAdminDashboardPageData = cache(
  async (storeId: string, period: ActivityPeriod = "week") => {
    const [attention, analytics, recentOrders] = await Promise.all([
      getAdminDashboardAttention(storeId),
      getAdminDashboardAnalytics(storeId, period),
      getAdminDashboardRecentOrders(storeId),
    ]);

    return {
      recentOrders,
      attention,
      analytics,
    };
  },
);

export async function getSalesActivity(storeId: string, period: ActivityPeriod) {
  const analytics = await getAdminDashboardAnalytics(storeId, period);
  return analytics.salesActivity;
}

export async function getDashboardAnalytics(
  storeId: string,
  period: ActivityPeriod = "week",
) {
  return getAdminDashboardAnalytics(storeId, period);
}
