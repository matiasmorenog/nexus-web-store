export {
  ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS,
  ADMIN_PRODUCTS_SUMMARY_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache-ttl";

export function adminDashboardCacheTag(storeId: string) {
  return `admin-dashboard-${storeId}`;
}

export function adminProductsSummaryCacheTag(storeId: string) {
  return `admin-products-summary-${storeId}`;
}
