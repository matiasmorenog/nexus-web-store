import type { AdminProductRow } from "@/components/admin/admin-products-section";
import {
  ADMIN_PRODUCTS_SUMMARY_CACHE_REVALIDATE_SECONDS,
  adminProductsSummaryCacheTag,
} from "@/lib/admin-cache-tags";
import {
  PRODUCT_CATEGORIES,
  STORE_AUDIENCES,
} from "@/lib/categories";
import {
  adminProductSortUsesInMemory,
  getAdminProductPrismaOrderBy,
  parseAdminProductSort,
  sortAdminProducts,
} from "@/lib/admin-product-sort";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { ADMIN_PRODUCTS_PAGE_SIZE, adminListSkip } from "@/lib/admin-pagination";
import { Prisma } from "@prisma/client";

export type AdminProductsFilterParams = {
  q?: string;
  categoria?: string;
  genero?: string;
  estado?: string;
  stock?: string;
  orden?: string;
};

export const ADMIN_PRODUCT_ESTADO_INACTIVE = "desactivado";

/** Search or facet filters applied on top of the default (active) catalog. */
export function hasAdminProductListQuery(
  params: AdminProductsFilterParams,
) {
  return Boolean(
    params.q?.trim() ||
      params.categoria ||
      params.genero ||
      params.estado ||
      params.stock,
  );
}

const VALID_CATEGORIES = new Set(
  PRODUCT_CATEGORIES.map((category) => category.slug),
);

const VALID_AUDIENCES = new Set(STORE_AUDIENCES.map((audience) => audience.slug));

const listVariantSelect = { imageUrl: true, price: true } as const;

const productInclude = {
  variants: {
    orderBy: { price: "asc" as const },
    take: 1,
    select: listVariantSelect,
  },
  _count: { select: { variants: true } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function buildAdminProductsWhere(
  storeId: string,
  params: AdminProductsFilterParams,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    storeId,
    active: params.estado !== ADMIN_PRODUCT_ESTADO_INACTIVE,
  };

  if (params.categoria && VALID_CATEGORIES.has(params.categoria as never)) {
    where.category = params.categoria;
  }

  if (params.genero && VALID_AUDIENCES.has(params.genero as never)) {
    where.audience = params.genero;
  }

  if (params.estado === "destacado") {
    where.featured = true;
  } else if (params.estado === "2x1") {
    where.promo2x1 = true;
  } else if (params.estado === "normal") {
    where.featured = false;
    where.promo2x1 = false;
  }

  if (params.stock === "sin-stock") {
    where.variants = { some: { stock: { lte: 0 } } };
  } else if (params.stock === "agotado") {
    where.variants = { none: { stock: { gt: 0 } } };
  }

  const query = params.q?.trim();
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      {
        variants: {
          some: {
            OR: [
              { sku: { contains: query, mode: "insensitive" } },
              { color: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  return where;
}

async function fetchAdminProductsBatch(
  storeId: string,
  page: number,
  params: AdminProductsFilterParams,
) {
  const where = buildAdminProductsWhere(storeId, params);
  const orden = parseAdminProductSort(params.orden);

  if (adminProductSortUsesInMemory(orden)) {
    const all = await db.product.findMany({
      where,
      include: {
        variants: { orderBy: { price: "asc" }, select: listVariantSelect },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const sorted = sortAdminProducts(all, orden);
    const skip = adminListSkip(page);
    return sorted
      .slice(skip, skip + ADMIN_PRODUCTS_PAGE_SIZE)
      .map((product) => ({ ...product, variants: product.variants.slice(0, 1) }));
  }

  return db.product.findMany({
    where,
    include: productInclude,
    orderBy: getAdminProductPrismaOrderBy(orden),
    skip: adminListSkip(page),
    take: ADMIN_PRODUCTS_PAGE_SIZE,
  });
}

export function mapAdminProductRow(product: ProductWithRelations): AdminProductRow {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    audience: product.audience,
    featured: product.featured,
    promo2x1: product.promo2x1,
    active: product.active,
    variants: product.variants.map((variant) => ({
      imageUrl: variant.imageUrl,
      price: Number(variant.price),
    })),
    _count: product._count,
  };
}

export async function getAdminProductsPage(
  storeId: string,
  page = 1,
  params: AdminProductsFilterParams = {},
) {
  const where = buildAdminProductsWhere(storeId, params);
  const orden = parseAdminProductSort(params.orden);

  // Neon pooler: connection_limit=1 — never Promise.all separate connections.
  if (adminProductSortUsesInMemory(orden)) {
    const products = await fetchAdminProductsBatch(storeId, page, params);
    const total = await db.product.count({ where });
    const rows = products.map(mapAdminProductRow);
    return {
      products: rows,
      total,
      page,
      hasMore: adminListSkip(page) + rows.length < total,
    };
  }

  const [products, total] = await db.$transaction([
    db.product.findMany({
      where,
      include: productInclude,
      orderBy: getAdminProductPrismaOrderBy(orden),
      skip: adminListSkip(page),
      take: ADMIN_PRODUCTS_PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  const rows = products.map(mapAdminProductRow);

  return {
    products: rows,
    total,
    page,
    hasMore: adminListSkip(page) + rows.length < total,
  };
}

async function fetchAdminProductsSummary(storeId: string) {
  const activeWhere = { storeId, active: true };

  // Array transaction (one connection). Interactive tx + parallel page queries → P2024.
  const [
    totalProducts,
    categoryGroups,
    audienceGroups,
    destacado,
    promo2x1,
    normal,
    desactivado,
  ] = await db.$transaction([
    db.product.count({ where: activeWhere }),
    db.product.groupBy({
      by: ["category"],
      where: activeWhere,
      orderBy: { category: "asc" },
      _count: { _all: true },
    }),
    db.product.groupBy({
      by: ["audience"],
      where: activeWhere,
      orderBy: { audience: "asc" },
      _count: { _all: true },
    }),
    db.product.count({
      where: { ...activeWhere, featured: true },
    }),
    db.product.count({
      where: { ...activeWhere, promo2x1: true },
    }),
    db.product.count({
      where: { ...activeWhere, featured: false, promo2x1: false },
    }),
    db.product.count({
      where: { storeId, active: false },
    }),
  ]);

  const categoryCounts = Object.fromEntries(
    PRODUCT_CATEGORIES.map((category) => {
      const group = categoryGroups.find((row) => row.category === category.slug);
      const count =
        group && typeof group._count === "object"
          ? (group._count._all ?? 0)
          : 0;
      return [category.slug, count];
    }),
  ) as Record<string, number>;

  const audienceCounts = Object.fromEntries(
    STORE_AUDIENCES.map((audience) => {
      const group = audienceGroups.find((row) => row.audience === audience.slug);
      const count =
        group && typeof group._count === "object"
          ? (group._count._all ?? 0)
          : 0;
      return [audience.slug, count];
    }),
  ) as Record<string, number>;

  return {
    totalProducts,
    categoryCounts,
    audienceCounts,
    estadoCounts: {
      destacado,
      promo2x1,
      normal,
      desactivado,
    },
  };
}

/**
 * Página productos: summary (cache) + listado en serie.
 * Neon pooler connection_limit=1 — no Promise.all entre estas queries.
 */
export const getAdminProductsPageData = cache(
  async (storeId: string, params: AdminProductsFilterParams = {}) => {
    const summary = await getAdminProductsSummary(storeId);
    const page = await getAdminProductsPage(storeId, 1, params);
    return { summary, page };
  },
);

function getCachedAdminProductsSummary(storeId: string) {
  return unstable_cache(
    () => fetchAdminProductsSummary(storeId),
    ["admin-products-summary", storeId],
    {
      revalidate: ADMIN_PRODUCTS_SUMMARY_CACHE_REVALIDATE_SECONDS,
      tags: [adminProductsSummaryCacheTag(storeId)],
    },
  )();
}

export const getAdminProductsSummary = cache(async (storeId: string) => {
  return getCachedAdminProductsSummary(storeId);
});

export function adminProductsFilterKey(params: AdminProductsFilterParams) {
  return [
    params.q?.trim() ?? "",
    params.categoria ?? "",
    params.genero ?? "",
    params.estado ?? "",
    params.stock ?? "",
    params.orden ?? "",
  ].join("|");
}
