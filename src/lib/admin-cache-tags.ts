export const ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS = 60;
export const ADMIN_PRODUCTS_SUMMARY_CACHE_REVALIDATE_SECONDS = 60;

export function adminDashboardCacheTag(storeId: string) {
  return `admin-dashboard-${storeId}`;
}

export function adminProductsSummaryCacheTag(storeId: string) {
  return `admin-products-summary-${storeId}`;
}
