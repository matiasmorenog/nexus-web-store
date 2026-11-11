import { revalidateTag } from "next/cache";
import {
  adminDashboardCacheTag,
  adminOrdersSummaryCacheTag,
  adminProductsSummaryCacheTag,
} from "@/lib/admin-cache-tags";

export function revalidateAdminDashboardCache(storeId: string) {
  revalidateTag(adminDashboardCacheTag(storeId), { expire: 0 });
}

export function revalidateAdminProductsSummaryCache(storeId: string) {
  revalidateTag(adminProductsSummaryCacheTag(storeId), { expire: 0 });
}

export function revalidateAdminOrdersSummaryCache(storeId: string) {
  revalidateTag(adminOrdersSummaryCacheTag(storeId), { expire: 0 });
}

/** Dashboard (stock en alertas) + facetas del listado de productos. */
export function revalidateAdminProductDataCaches(storeId: string) {
  revalidateAdminDashboardCache(storeId);
  revalidateAdminProductsSummaryCache(storeId);
}

/** Dashboard + facetas de pedidos (status / pago). */
export function revalidateAdminOrderDataCaches(storeId: string) {
  revalidateAdminDashboardCache(storeId);
  revalidateAdminOrdersSummaryCache(storeId);
}

// Pagos: tags storefront + dashboard en fulfillPaidOrder (sin queries extra).
