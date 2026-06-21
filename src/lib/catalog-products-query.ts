import {
  buildCatalogProductWhere,
  type CatalogQueryParams,
} from "@/lib/catalog-query";
import { CATALOG_PAGE_SIZE, catalogListSkip } from "@/lib/catalog-pagination";
import { db } from "@/lib/db";
import {
  parseProductSort,
  sortProducts,
  type ProductSort,
} from "@/lib/product-sort";
import { getProductSalesTotals } from "@/lib/product-sales";
import {
  getProductCardImages,
  partitionVariantsForCard,
} from "@/lib/variant-images";

export type CatalogProductsFilterParams = Omit<CatalogQueryParams, "storeId">;

export type CatalogProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  audience: string;
  promo2x1: boolean;
  imageUrl: string;
  hoverImageUrl?: string;
  price: number;
  inStock: boolean;
};

const productInclude = {
  variants: {
    orderBy: { price: "asc" as const },
    select: { color: true, imageUrl: true, price: true, stock: true },
  },
} as const;

type ProductWithVariants = {
  id: string;
  slug: string;
  name: string;
  category: string;
  audience: string;
  promo2x1: boolean;
  createdAt: Date;
  variants: {
    color: string;
    imageUrl: string | null;
    price: unknown;
    stock: number;
  }[];
};

export function catalogSortUsesInMemory(sort: ProductSort) {
  return sort === "mas-vendidos" || sort === "precio-asc" || sort === "precio-desc";
}

export function mapCatalogProductRow(product: ProductWithVariants): CatalogProductRow {
  const variants = product.variants.map((variant) => ({
    ...variant,
    imageUrl: variant.imageUrl ?? "",
  }));
  const { inStock, displayVariants } = partitionVariantsForCard(variants);
  const cardImages = getProductCardImages(displayVariants);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    audience: product.audience,
    promo2x1: product.promo2x1,
    imageUrl: cardImages.imageUrl,
    hoverImageUrl: cardImages.hoverImageUrl,
    price: cardImages.price,
    inStock,
  };
}

async function fetchCatalogProductsBatch(
  storeId: string,
  params: CatalogProductsFilterParams,
) {
  const where = buildCatalogProductWhere({ storeId, ...params });

  return db.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: "desc" },
  }) as Promise<ProductWithVariants[]>;
}

export async function getCatalogProductsPage(
  storeId: string,
  page = 1,
  params: CatalogProductsFilterParams = {},
) {
  const where = buildCatalogProductWhere({ storeId, ...params });
  const sort = parseProductSort(params.orden);

  if (catalogSortUsesInMemory(sort)) {
    const all = await fetchCatalogProductsBatch(storeId, params);
    const salesTotals =
      sort === "mas-vendidos"
        ? await getProductSalesTotals(storeId)
        : undefined;
    const sorted = sortProducts(all, sort, salesTotals);
    const total = sorted.length;
    const skip = catalogListSkip(page);
    const slice = sorted.slice(skip, skip + CATALOG_PAGE_SIZE);

    return {
      products: slice.map(mapCatalogProductRow),
      total,
      hasMore: skip + slice.length < total,
    };
  }

  const orderBy =
    sort === "nombre-asc"
      ? ({ name: "asc" } as const)
      : ({ createdAt: "desc" } as const);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: catalogListSkip(page),
      take: CATALOG_PAGE_SIZE,
    }) as Promise<ProductWithVariants[]>,
    db.product.count({ where }),
  ]);

  const rows = products.map(mapCatalogProductRow);

  return {
    products: rows,
    total,
    hasMore: catalogListSkip(page) + rows.length < total,
  };
}
