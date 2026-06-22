import { revalidateTag } from "next/cache";
import {
  adminDashboardCacheTag,
  adminProductsSummaryCacheTag,
} from "@/lib/admin-cache-tags";

export function revalidateAdminDashboardCache(storeId: string) {
  revalidateTag(adminDashboardCacheTag(storeId), { expire: 0 });
}

export function revalidateAdminProductsSummaryCache(storeId: string) {
  revalidateTag(adminProductsSummaryCacheTag(storeId), { expire: 0 });
}

/** Dashboard (stock en alertas) + facetas del listado de productos. */
export function revalidateAdminProductDataCaches(storeId: string) {
  revalidateAdminDashboardCache(storeId);
  revalidateAdminProductsSummaryCache(storeId);
}

// Pagos vía webhook/checkout: sin revalidateTag (TTL 60s).
