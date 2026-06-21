import type { AdminProductRow } from "@/components/admin/admin-products-section";
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
import { db } from "@/lib/db";
import { ADMIN_PRODUCTS_PAGE_SIZE, adminListSkip } from "@/lib/admin-pagination";
import { Prisma } from "@prisma/client";

export type AdminProductsFilterParams = {
  q?: string;
  categoria?: string;
  genero?: string;
  estado?: string;
  orden?: string;
};

const VALID_CATEGORIES = new Set(
  PRODUCT_CATEGORIES.map((category) => category.slug),
);

const VALID_AUDIENCES = new Set(STORE_AUDIENCES.map((audience) => audience.slug));

const productInclude = {
  variants: { orderBy: { price: "asc" as const }, take: 1 },
  _count: { select: { variants: true } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function buildAdminProductsWhere(
  storeId: string,
  params: AdminProductsFilterParams,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { storeId };

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
        variants: { orderBy: { price: "asc" } },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const sorted = sortAdminProducts(all, orden);
    const skip = adminListSkip(page);
    return sorted.slice(skip, skip + ADMIN_PRODUCTS_PAGE_SIZE);
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

  const [products, total] = await Promise.all([
    fetchAdminProductsBatch(storeId, page, params),
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

export async function getAdminProductsSummary(storeId: string) {
  const [
    totalProducts,
    categoryGroups,
    audienceGroups,
    destacado,
    promo2x1,
    normal,
  ] = await Promise.all([
    db.product.count({ where: { storeId } }),
    db.product.groupBy({
      by: ["category"],
      where: { storeId },
      _count: { _all: true },
    }),
    db.product.groupBy({
      by: ["audience"],
      where: { storeId },
      _count: { _all: true },
    }),
    db.product.count({ where: { storeId, featured: true } }),
    db.product.count({ where: { storeId, promo2x1: true } }),
    db.product.count({
      where: { storeId, featured: false, promo2x1: false },
    }),
  ]);

  const categoryCounts = Object.fromEntries(
    PRODUCT_CATEGORIES.map((category) => [
      category.slug,
      categoryGroups.find((group) => group.category === category.slug)?._count
        ._all ?? 0,
    ]),
  ) as Record<string, number>;

  const audienceCounts = Object.fromEntries(
    STORE_AUDIENCES.map((audience) => [
      audience.slug,
      audienceGroups.find((group) => group.audience === audience.slug)?._count
        ._all ?? 0,
    ]),
  ) as Record<string, number>;

  return {
    totalProducts,
    categoryCounts,
    audienceCounts,
    estadoCounts: {
      destacado,
      promo2x1,
      normal,
    },
  };
}

export function adminProductsFilterKey(params: AdminProductsFilterParams) {
  return [
    params.q?.trim() ?? "",
    params.categoria ?? "",
    params.genero ?? "",
    params.estado ?? "",
    params.orden ?? "",
  ].join("|");
}
