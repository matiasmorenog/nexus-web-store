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
  AnalyticsPeriodMetrics,
  AnalyticsRetentionWeek,
} from "@/lib/advanced-analytics/types";

const RETENTION_WEEKS = 6;
const TOP_CATEGORIES_LIMIT = 8;

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
 * Weekly retention: rows = first paid-order week (cohort), columns = W0..W5
 * % of cohort customers with a paid order in that offset week.
 */
async function fetchWeeklyRetention(
  storeId: string,
  range: { start: Date; end: Date },
): Promise<AnalyticsRetentionWeek[]> {
  const rows = await db.$queryRaw<
    {
      cohortWeek: Date;
      weekOffset: number;
      cohortSize: number;
      retained: number;
    }[]
  >`
    WITH first_paid AS (
      SELECT
        o."customerEmail" AS email,
        date_trunc('week', MIN(o."createdAt")) AS "cohortWeek"
      FROM "Order" o
      WHERE o."storeId" = ${storeId}
        AND o.status IN ('PAID', 'SHIPPED')
        AND o."createdAt" >= ${range.start}
        AND o."createdAt" <= ${range.end}
      GROUP BY o."customerEmail"
    ),
    cohort_sizes AS (
      SELECT "cohortWeek", COUNT(*)::int AS "cohortSize"
      FROM first_paid
      GROUP BY "cohortWeek"
    ),
    activity AS (
      SELECT
        fp."cohortWeek",
        FLOOR(
          EXTRACT(EPOCH FROM (date_trunc('week', o."createdAt") - fp."cohortWeek"))
          / (7 * 24 * 60 * 60)
        )::int AS "weekOffset",
        COUNT(DISTINCT o."customerEmail")::int AS retained
      FROM first_paid fp
      INNER JOIN "Order" o
        ON o."customerEmail" = fp.email
       AND o."storeId" = ${storeId}
       AND o.status IN ('PAID', 'SHIPPED')
       AND o."createdAt" >= fp."cohortWeek"
       AND o."createdAt" <= ${range.end}
      GROUP BY fp."cohortWeek", 2
    )
    SELECT
      cs."cohortWeek",
      a."weekOffset",
      cs."cohortSize",
      a.retained
    FROM cohort_sizes cs
    INNER JOIN activity a ON a."cohortWeek" = cs."cohortWeek"
    WHERE a."weekOffset" >= 0
      AND a."weekOffset" < ${RETENTION_WEEKS}
    ORDER BY cs."cohortWeek" ASC, a."weekOffset" ASC
  `;

  const byWeek = new Map<string, AnalyticsRetentionWeek>();
  const now = new Date();

  for (const row of rows) {
    const key = row.cohortWeek.toISOString().slice(0, 10);
    let entry = byWeek.get(key);
    if (!entry) {
      entry = {
        cohortWeek: key,
        cohortSize: row.cohortSize,
        weeks: Array.from({ length: RETENTION_WEEKS }, () => null),
      };
      byWeek.set(key, entry);
    }

    const cohortStart = new Date(row.cohortWeek);
    const weekEnd = new Date(cohortStart);
    weekEnd.setDate(weekEnd.getDate() + (row.weekOffset + 1) * 7 - 1);

    if (weekEnd > now) {
      entry.weeks[row.weekOffset] = null;
      continue;
    }

    entry.weeks[row.weekOffset] =
      row.cohortSize > 0 ? (row.retained / row.cohortSize) * 100 : 0;
  }

  // W0 = first-purchase week; if missing from activity join, treat as 100%.
  for (const entry of byWeek.values()) {
    if (entry.cohortSize > 0 && entry.weeks[0] == null) {
      entry.weeks[0] = 100;
    }
  }

  return Array.from(byWeek.values()).sort((a, b) =>
    a.cohortWeek.localeCompare(b.cohortWeek),
  );
}

async function fetchAdvancedAnalyticsReport(
  storeId: string,
  period: ActivityPeriod,
): Promise<AdvancedAnalyticsReport> {
  const ranges = getAnalyticsPeriodRanges(period);
  const [current, previous, cohort, retention, topCategories] =
    await Promise.all([
      fetchPeriodMetrics(storeId, ranges.current),
      fetchPeriodMetrics(storeId, ranges.previous),
      fetchCustomerCohort(storeId, ranges.current),
      fetchWeeklyRetention(storeId, ranges.current),
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
    retention,
    topCategories,
  };
}

export async function getAdvancedAnalyticsReport(
  storeId: string,
  period: ActivityPeriod,
): Promise<AdvancedAnalyticsReport> {
  return unstable_cache(
    () => fetchAdvancedAnalyticsReport(storeId, period),
    ["advanced-analytics-report", storeId, period, "v2"],
    {
      revalidate: ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
      tags: [adminDashboardCacheTag(storeId), `advanced-analytics:${storeId}`],
    },
  )();
}
