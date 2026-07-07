import { unstable_cache } from "next/cache";
import type { ActivityPeriod } from "@/lib/admin-analytics-shared";
import {
  ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
  adminDashboardCacheTag,
} from "@/lib/admin-cache-tags";
import { db } from "@/lib/db";
import {
  getAnalyticsPeriodRanges,
  percentChange,
} from "@/lib/advanced-analytics/format";
import type {
  AdvancedAnalyticsReport,
  AnalyticsCustomerCohort,
  AnalyticsPeriodMetrics,
} from "@/lib/advanced-analytics/types";

async function fetchPeriodMetrics(
  storeId: string,
  range: { start: Date; end: Date },
): Promise<AnalyticsPeriodMetrics> {
  const [totals, paid, cancelled] = await Promise.all([
    db.order.count({
      where: {
        storeId,
        createdAt: { gte: range.start, lte: range.end },
      },
    }),
    db.order.aggregate({
      where: {
        storeId,
        createdAt: { gte: range.start, lte: range.end },
        status: { in: ["PAID", "SHIPPED"] },
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    db.order.count({
      where: {
        storeId,
        createdAt: { gte: range.start, lte: range.end },
        status: "CANCELLED",
      },
    }),
  ]);

  const paidOrders = paid._count._all;
  const revenue = Number(paid._sum.total?.toString() ?? "0");
  const averageOrderValue = paidOrders > 0 ? revenue / paidOrders : 0;
  const conversionRate = totals > 0 ? (paidOrders / totals) * 100 : 0;

  return {
    orders: totals,
    paidOrders,
    cancelledOrders: cancelled,
    revenue,
    averageOrderValue,
    conversionRate,
  };
}

async function fetchCustomerCohort(
  storeId: string,
  range: { start: Date; end: Date },
): Promise<AnalyticsCustomerCohort> {
  const rows = await db.$queryRaw<
    { uniqueCustomers: number; returningCustomers: number }[]
  >`
    SELECT
      COUNT(DISTINCT o."customerEmail")::int AS "uniqueCustomers",
      COUNT(DISTINCT CASE
        WHEN EXISTS (
          SELECT 1
          FROM "Order" prev
          WHERE prev."storeId" = o."storeId"
            AND prev."customerEmail" = o."customerEmail"
            AND prev."createdAt" < ${range.start}
            AND prev.status IN ('PAID', 'SHIPPED')
        ) THEN o."customerEmail"
      END)::int AS "returningCustomers"
    FROM "Order" o
    WHERE o."storeId" = ${storeId}
      AND o."createdAt" >= ${range.start}
      AND o."createdAt" <= ${range.end}
      AND o.status IN ('PAID', 'SHIPPED')
  `;

  const uniqueCustomers = rows[0]?.uniqueCustomers ?? 0;
  const returningCustomers = rows[0]?.returningCustomers ?? 0;
  const newCustomers = Math.max(uniqueCustomers - returningCustomers, 0);
  const repeatRate =
    uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;

  return {
    uniqueCustomers,
    returningCustomers,
    newCustomers,
    repeatRate,
  };
}

async function fetchTopProductsForRange(
  storeId: string,
  rangeStart: Date,
  limit = 10,
) {
  return db.$queryRaw<
    { productId: string; name: string; quantity: number; revenue: number }[]
  >`
    SELECT
      p.id AS "productId",
      p.name,
      SUM(oi.quantity)::int AS quantity,
      COALESCE(SUM(oi.quantity * oi."unitPrice"), 0)::float AS revenue
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON oi."orderId" = o.id
    INNER JOIN "ProductVariant" pv ON oi."variantId" = pv.id
    INNER JOIN "Product" p ON pv."productId" = p.id
    WHERE o."storeId" = ${storeId}
      AND o.status IN ('PAID', 'SHIPPED')
      AND o."createdAt" >= ${rangeStart}
    GROUP BY p.id, p.name
    ORDER BY quantity DESC
    LIMIT ${limit}
  `;
}

async function fetchAdvancedAnalyticsReport(
  storeId: string,
  period: ActivityPeriod,
): Promise<AdvancedAnalyticsReport> {
  const ranges = getAnalyticsPeriodRanges(period);
  const [current, previous, cohort, topProducts] = await Promise.all([
    fetchPeriodMetrics(storeId, ranges.current),
    fetchPeriodMetrics(storeId, ranges.previous),
    fetchCustomerCohort(storeId, ranges.current),
    fetchTopProductsForRange(storeId, ranges.current.start, 10),
  ]);

  return {
    period,
    comparison: {
      current,
      previous,
      revenueChangePct: percentChange(current.revenue, previous.revenue),
      ordersChangePct: percentChange(current.orders, previous.orders),
      paidOrdersChangePct: percentChange(current.paidOrders, previous.paidOrders),
      aovChangePct: percentChange(
        current.averageOrderValue,
        previous.averageOrderValue,
      ),
    },
    cohort,
    topProducts,
  };
}

export async function getAdvancedAnalyticsReport(
  storeId: string,
  period: ActivityPeriod,
): Promise<AdvancedAnalyticsReport> {
  return unstable_cache(
    () => fetchAdvancedAnalyticsReport(storeId, period),
    ["advanced-analytics-report", storeId, period],
    {
      revalidate: ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
      tags: [adminDashboardCacheTag(storeId), `advanced-analytics:${storeId}`],
    },
  )();
}
