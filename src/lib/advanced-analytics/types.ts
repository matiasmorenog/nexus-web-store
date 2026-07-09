import type { ActivityPeriod } from "@/lib/admin-analytics-shared";

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

export type AnalyticsCategoryRank = {
  category: string;
  quantity: number;
  revenue: number;
};

export type AnalyticsRetentionWeek = {
  /** ISO date (YYYY-MM-DD) of the cohort week start (Monday). */
  cohortWeek: string;
  cohortSize: number;
  /** Retention % for W0..Wn (null when week not yet elapsed). */
  weeks: (number | null)[];
};

export type AdvancedAnalyticsReport = {
  period: ActivityPeriod;
  comparison: AnalyticsPeriodComparison;
  cohort: AnalyticsCustomerCohort;
  retention: AnalyticsRetentionWeek[];
  topCategories: AnalyticsCategoryRank[];
};

export type AnalyticsDateRange = {
  start: Date;
  end: Date;
};

export type AnalyticsPeriodRanges = {
  current: AnalyticsDateRange;
  previous: AnalyticsDateRange;
};
