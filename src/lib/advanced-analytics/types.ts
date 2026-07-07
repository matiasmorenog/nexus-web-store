import type { ActivityPeriod } from "@/lib/admin-analytics-shared";
import type { TopProduct } from "@/lib/admin-analytics-shared";

export type AnalyticsPeriodMetrics = {
  orders: number;
  paidOrders: number;
  cancelledOrders: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
};

export type AnalyticsPeriodComparison = {
  current: AnalyticsPeriodMetrics;
  previous: AnalyticsPeriodMetrics;
  revenueChangePct: number | null;
  ordersChangePct: number | null;
  paidOrdersChangePct: number | null;
  aovChangePct: number | null;
};

export type AnalyticsCustomerCohort = {
  uniqueCustomers: number;
  returningCustomers: number;
  newCustomers: number;
  repeatRate: number;
};

export type AdvancedAnalyticsReport = {
  period: ActivityPeriod;
  comparison: AnalyticsPeriodComparison;
  cohort: AnalyticsCustomerCohort;
  topProducts: TopProduct[];
};

export type AnalyticsDateRange = {
  start: Date;
  end: Date;
};

export type AnalyticsPeriodRanges = {
  current: AnalyticsDateRange;
  previous: AnalyticsDateRange;
};
