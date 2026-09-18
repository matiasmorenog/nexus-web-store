import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { getStorefrontConfig } from "@/lib/store-verticals";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import {
  toProductCategoryDef,
  type StoreCategoryListItem,
  type StoreCategoryRow,
} from "@/lib/store-categories/types";

export const STORE_CATEGORIES_CACHE_TAG = "store-categories";

function parseAudiences(value: Prisma.JsonValue | null): string[] | null {
  if (!Array.isArray(value)) return null;
  const audiences = value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  return audiences.length > 0 ? audiences : null;
}

function mapRow(row: {
  id: string;
  storeId: string;
  slug: string;
  label: string;
  sortOrder: number;
  audiences: Prisma.JsonValue | null;
  showInNav: boolean;
}): StoreCategoryRow {
  return {
    id: row.id,
    storeId: row.storeId,
    slug: row.slug,
    label: row.label,
    sortOrder: row.sortOrder,
    audiences: parseAudiences(row.audiences),
    showInNav: row.showInNav,
  };
}

async function loadStoreCategoryRows(
  storeId: string,
): Promise<StoreCategoryRow[]> {
  const rows = await db.storeCategory.findMany({
    where: { storeId },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
  return rows.map(mapRow);
}

/** Admin: filas reales de DB (sin fallback). */
export async function getStoreCategoriesForAdmin(
  storeId: string,
): Promise<StoreCategoryListItem[]> {
  return loadStoreCategoryRows(storeId);
}

async function loadStoreCategoriesWithFallback(
  storeId: string,
): Promise<ProductCategoryDef[]> {
  const rows = await loadStoreCategoryRows(storeId);
  if (rows.length === 0) {
    return [...getStorefrontConfig().productCategories];
  }
  return rows.map(toProductCategoryDef);
}

/** Storefront: DB cacheada; si vacío, fallback a vertical config. */
export async function getStoreCategories(
  storeId: string,
): Promise<ProductCategoryDef[]> {
  const cached = unstable_cache(
    () => loadStoreCategoriesWithFallback(storeId),
    [`store-categories-${storeId}`],
    {
      tags: [
        STORE_CATEGORIES_CACHE_TAG,
        `${STORE_CATEGORIES_CACHE_TAG}:${storeId}`,
      ],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  return cached();
}

export async function storeHasCategorySlug(
  storeId: string,
  slug: string,
): Promise<boolean> {
  const categories = await getStoreCategories(storeId);
  return categories.some((category) => category.slug === slug);
}
