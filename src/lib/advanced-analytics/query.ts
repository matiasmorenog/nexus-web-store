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
  AnalyticsCategoryRank,
  AnalyticsCustomerCohort,
  AnalyticsLoyalCustomer,
  AnalyticsPeriodMetrics,
} from "@/lib/advanced-analytics/types";

const TOP_CATEGORIES_LIMIT = 8;
const LOYAL_CUSTOMERS_LIMIT = 10;

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

async function fetchTopCategories(
  storeId: string,
  range: { start: Date; end: Date },
): Promise<AnalyticsCategoryRank[]> {
  return db.$queryRaw<AnalyticsCategoryRank[]>`
    SELECT
      p.category AS category,
      SUM(oi.quantity)::int AS quantity,
      COALESCE(SUM(oi.quantity * oi."unitPrice"), 0)::float AS revenue
    FROM "OrderItem" oi
    INNER JOIN "Order" o ON oi."orderId" = o.id
    INNER JOIN "ProductVariant" pv ON oi."variantId" = pv.id
    INNER JOIN "Product" p ON pv."productId" = p.id
    WHERE o."storeId" = ${storeId}
      AND o.status IN ('PAID', 'SHIPPED')
      AND o."createdAt" >= ${range.start}
      AND o."createdAt" <= ${range.end}
    GROUP BY p.category
    ORDER BY quantity DESC
    LIMIT ${TOP_CATEGORIES_LIMIT}
  `;
}

/**
 * Top customers in the period by paid order count, then revenue.
 * Actionable for small apparel shops (contact / reward repeat buyers).
 */
async function fetchLoyalCustomers(
  storeId: string,
  range: { start: Date; end: Date },
): Promise<AnalyticsLoyalCustomer[]> {
  const rows = await db.$queryRaw<
    {
      email: string;
      name: string;
      orderCount: number;
      revenue: number;
      lastOrderAt: Date;
    }[]
  >`
    SELECT
      o."customerEmail" AS email,
      (ARRAY_AGG(o."customerName" ORDER BY o."createdAt" DESC))[1] AS name,
      COUNT(*)::int AS "orderCount",
      COALESCE(SUM(o.total), 0)::float AS revenue,
      MAX(o."createdAt") AS "lastOrderAt"
    FROM "Order" o
    WHERE o."storeId" = ${storeId}
      AND o.status IN ('PAID', 'SHIPPED')
      AND o."createdAt" >= ${range.start}
      AND o."createdAt" <= ${range.end}
    GROUP BY o."customerEmail"
    ORDER BY "orderCount" DESC, revenue DESC
    LIMIT ${LOYAL_CUSTOMERS_LIMIT}
  `;

  return rows.map((row) => ({
    email: row.email,
    name: row.name,
    orderCount: row.orderCount,
    revenue: row.revenue,
    lastOrderAt: row.lastOrderAt.toISOString(),
  }));
}

async function fetchAdvancedAnalyticsReport(
  storeId: string,
  period: ActivityPeriod,
): Promise<AdvancedAnalyticsReport> {
  const ranges = getAnalyticsPeriodRanges(period);
  const [current, previous, cohort, loyalCustomers, topCategories] =
    await Promise.all([
      fetchPeriodMetrics(storeId, ranges.current),
      fetchPeriodMetrics(storeId, ranges.previous),
      fetchCustomerCohort(storeId, ranges.current),
      fetchLoyalCustomers(storeId, ranges.current),
      fetchTopCategories(storeId, ranges.current),
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
    loyalCustomers,
    topCategories,
  };
}

export async function getAdvancedAnalyticsReport(
  storeId: string,
  period: ActivityPeriod,
): Promise<AdvancedAnalyticsReport> {
  return unstable_cache(
    () => fetchAdvancedAnalyticsReport(storeId, period),
    ["advanced-analytics-report", storeId, period, "v3"],
    {
      revalidate: ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
      tags: [adminDashboardCacheTag(storeId), `advanced-analytics:${storeId}`],
    },
  )();
}
