import { audiencesForProductFilter } from "@/lib/categories";
import { CATALOG_PAGE_SIZE, catalogListSkip } from "@/lib/catalog-pagination";
import {
  getProductCardImages,
  partitionVariantsForCard,
} from "@/lib/variant-images";
import { parseProductSort, sortProducts } from "@/lib/product-sort";

export type CatalogParams = {
  categoria?: string;
  genero?: string;
  talle?: string;
  nicotina?: string;
  sabor?: string;
  precioMax?: string;
  q?: string;
  orden?: string;
  promo?: string;
  destacados?: string;
};

export type CatalogIndexVariant = {
  size: string;
  color: string;
  sku: string;
  stock: number;
  price: number;
  imageUrl: string;
};

export type CatalogIndexProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  featured: boolean;
  promo2x1: boolean;
  createdAt: string;
  variants: CatalogIndexVariant[];
};

export type CatalogIndexData = {
  products: CatalogIndexProduct[];
};

export type CatalogProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  audience: string;
  promo2x1: boolean;
  featured: boolean;
  imageUrl: string;
  hoverImageUrl?: string;
  price: number;
  inStock: boolean;
};

export type CatalogFilterCounts = {
  genero: {
    all: number;
    mujer: number;
    hombre: number;
  };
  categoria: Record<string, number>;
  categoriaAll: number;
  talle: Record<string, number>;
  nicotina: Record<string, number>;
  sabor: Record<string, number>;
  destacados: number;
  promo2x1: number;
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"] as const;

type CatalogFacet = {
  genero?: string;
  categoria?: string;
  talle?: string;
  nicotina?: string;
  sabor?: string;
  featured?: boolean;
  promo2x1?: boolean;
};

type CatalogPromoFacet = "promo" | "destacados";

type MatchOptions = {
  facet?: CatalogFacet;
  omit?: Array<keyof CatalogFacet | CatalogPromoFacet>;
};

export function parseCatalogParams(
  searchParams: URLSearchParams,
): CatalogParams {
  return {
    categoria: searchParams.get("categoria") ?? undefined,
    genero: searchParams.get("genero") ?? undefined,
    talle: searchParams.get("talle") ?? undefined,
    nicotina: searchParams.get("nicotina") ?? undefined,
    sabor: searchParams.get("sabor") ?? undefined,
    precioMax: searchParams.get("precioMax") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    orden: searchParams.get("orden") ?? undefined,
    promo: searchParams.get("promo") ?? undefined,
    destacados: searchParams.get("destacados") ?? undefined,
  };
}

export function matchesCatalogIndexProduct(
  product: CatalogIndexProduct,
  params: CatalogParams,
  options: MatchOptions = {},
): boolean {
  const { facet = {}, omit = [] } = options;

  const categoria = omit.includes("categoria")
    ? facet.categoria
    : (facet.categoria ?? params.categoria);

  const genero = omit.includes("genero")
    ? facet.genero
    : (facet.genero ?? params.genero);

  const talle = omit.includes("talle")
    ? facet.talle
    : (facet.talle ?? params.talle);

  const nicotina = omit.includes("nicotina")
    ? facet.nicotina
    : (facet.nicotina ?? params.nicotina);

  const sabor = omit.includes("sabor")
    ? facet.sabor
    : (facet.sabor ?? params.sabor);

  const variantSizeFilter = talle ?? nicotina;
  const variantColorFilter = sabor;

  if (!omit.includes("promo") && params.promo === "2x1" && !product.promo2x1) {
    return false;
  }

  if (!omit.includes("destacados") && params.destacados === "1" && !product.featured) {
    return false;
  }

  if (facet.promo2x1 && !product.promo2x1) {
    return false;
  }

  if (facet.featured && !product.featured) {
    return false;
  }

  if (categoria && product.category !== categoria) {
    return false;
  }

  const audienceFilter = audiencesForProductFilter(genero);
  if (audienceFilter && !audienceFilter.includes(product.audience)) {
    return false;
  }

  const searchQuery = params.q?.trim();
  if (searchQuery) {
    const needle = searchQuery.toLowerCase();
    const haystack = (value: string) => value.toLowerCase().includes(needle);
    const matchesSearch =
      haystack(product.name) ||
      haystack(product.description) ||
      haystack(product.category) ||
      product.variants.some(
        (variant) => haystack(variant.sku) || haystack(variant.color),
      );

    if (!matchesSearch) {
      return false;
    }
  }

  if (variantSizeFilter) {
    const hasSize = product.variants.some(
      (variant) => variant.size === variantSizeFilter && variant.stock > 0,
    );
    if (!hasSize) {
      return false;
    }
  }

  if (variantColorFilter) {
    const hasColor = product.variants.some(
      (variant) => variant.color === variantColorFilter && variant.stock > 0,
    );
    if (!hasColor) {
      return false;
    }
  }

  if (params.precioMax) {
    const maxPrice = parseInt(params.precioMax, 10);
    const hasAffordableVariant = product.variants.some(
      (variant) => variant.stock > 0 && variant.price <= maxPrice,
    );
    if (!hasAffordableVariant) {
      return false;
    }
  }

  return true;
}

function countMatchingProducts(
  products: CatalogIndexProduct[],
  params: CatalogParams,
  facet: CatalogFacet,
  omit: Array<keyof CatalogFacet | CatalogPromoFacet>,
) {
  return products.filter((product) =>
    matchesCatalogIndexProduct(product, params, { facet, omit }),
  ).length;
}

export function computeCatalogFilterCounts(
  products: CatalogIndexProduct[],
  params: CatalogParams,
  categorySlugs: string[],
  variantSizeOptions: string[] = [...SIZE_OPTIONS],
): CatalogFilterCounts {
  const count = (
    facet: CatalogFacet,
    omit: Array<keyof CatalogFacet | CatalogPromoFacet>,
  ) => countMatchingProducts(products, params, facet, omit);

  const categoryCounts = Object.fromEntries(
    categorySlugs.map((slug) => [slug, count({ categoria: slug }, ["categoria"])]),
  ) as Record<string, number>;

  const talleCounts = Object.fromEntries(
    variantSizeOptions.map((size) => [size, count({ talle: size }, ["talle", "nicotina"])]),
  ) as Record<string, number>;

  const nicotinaCounts = Object.fromEntries(
    variantSizeOptions.map((size) => [size, count({ nicotina: size }, ["nicotina", "talle"])]),
  ) as Record<string, number>;

  const saborOptions = [
    ...new Set(
      products.flatMap((product) =>
        product.variants
          .filter((variant) => variant.stock > 0)
          .map((variant) => variant.color),
      ),
    ),
  ].sort();

  const saborCounts = Object.fromEntries(
    saborOptions.map((color) => [color, count({ sabor: color }, ["sabor"])]),
  ) as Record<string, number>;

  return {
    genero: {
      all: count({}, ["genero"]),
      mujer: count({ genero: "mujer" }, ["genero"]),
      hombre: count({ genero: "hombre" }, ["genero"]),
    },
    categoria: categoryCounts,
    categoriaAll: count({}, ["categoria"]),
    talle: talleCounts,
    nicotina: nicotinaCounts,
    sabor: saborCounts,
    destacados: count({ featured: true }, ["destacados", "promo"]),
    promo2x1: count({ promo2x1: true }, ["promo", "destacados"]),
  };
}

export function mapCatalogProductRow(
  product: CatalogIndexProduct,
): CatalogProductRow {
  const { inStock, displayVariants } = partitionVariantsForCard(
    product.variants,
  );
  const cardImages = getProductCardImages(displayVariants);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    audience: product.audience,
    promo2x1: product.promo2x1,
    featured: product.featured,
    imageUrl: cardImages.imageUrl,
    hoverImageUrl: cardImages.hoverImageUrl,
    price: cardImages.price,
    inStock,
  };
}

export function filterCatalogProducts(
  index: CatalogIndexData,
  params: CatalogParams,
) {
  const filtered = index.products.filter((product) =>
    matchesCatalogIndexProduct(product, params),
  );
  const sort = parseProductSort(params.orden);
  const sorted = sortProducts(
    filtered.map((product) => ({
      ...product,
      createdAt: new Date(product.createdAt),
    })),
    sort,
  );

  return sorted.map((product) =>
    mapCatalogProductRow({
      ...product,
      createdAt: product.createdAt.toISOString(),
    }),
  );
}

export function paginateCatalogProducts(
  products: CatalogProductRow[],
  page = 1,
) {
  const skip = catalogListSkip(page);
  const slice = products.slice(skip, skip + CATALOG_PAGE_SIZE);

  return {
    products: slice,
    total: products.length,
    hasMore: skip + slice.length < products.length,
  };
}
