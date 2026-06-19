import { audiencesForProductFilter } from "@/lib/categories";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type CatalogQueryParams = {
  storeId: string;
  categoria?: string;
  genero?: string;
  talle?: string;
  precioMax?: string;
  q?: string;
};

type CatalogFacet = {
  genero?: string;
  categoria?: string;
  talle?: string;
};

type BuildCatalogWhereOptions = {
  facet?: CatalogFacet;
  omit?: Array<keyof CatalogFacet>;
};

export function buildCatalogProductWhere(
  params: CatalogQueryParams,
  options: BuildCatalogWhereOptions = {},
): Prisma.ProductWhereInput {
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

  const where: Prisma.ProductWhereInput = { storeId: params.storeId };

  if (categoria) {
    where.category = categoria;
  }

  const audienceFilter = audiencesForProductFilter(genero);
  if (audienceFilter) {
    where.audience = { in: audienceFilter };
  }

  const searchQuery = params.q?.trim();
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { category: { contains: searchQuery, mode: "insensitive" } },
      {
        variants: {
          some: {
            OR: [
              { sku: { contains: searchQuery, mode: "insensitive" } },
              { color: { contains: searchQuery, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  if (talle) {
    where.variants = { some: { size: talle, stock: { gt: 0 } } };
  }

  if (params.precioMax) {
    where.variants = {
      ...(where.variants as Prisma.ProductVariantListRelationFilter),
      some: {
        ...(where.variants as Prisma.ProductVariantListRelationFilter)?.some,
        price: { lte: parseInt(params.precioMax) },
        stock: { gt: 0 },
      },
    };
  }

  return where;
}

export type CatalogFilterCounts = {
  genero: {
    all: number;
    mujer: number;
    hombre: number;
  };
  categoria: Record<string, number>;
  categoriaAll: number;
  talle: Record<string, number>;
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"] as const;

export async function getCatalogFilterCounts(
  params: CatalogQueryParams,
  categorySlugs: string[],
): Promise<CatalogFilterCounts> {
  const count = (facet: CatalogFacet, omit: Array<keyof CatalogFacet>) =>
    db.product.count({
      where: buildCatalogProductWhere(params, { facet, omit }),
    });

  const [
    generoAll,
    generoMujer,
    generoHombre,
    categoriaAll,
    ...rest
  ] = await Promise.all([
    count({}, ["genero"]),
    count({ genero: "mujer" }, ["genero"]),
    count({ genero: "hombre" }, ["genero"]),
    count({}, ["categoria"]),
    ...categorySlugs.map((slug) => count({ categoria: slug }, ["categoria"])),
    ...SIZE_OPTIONS.map((size) => count({ talle: size }, ["talle"])),
  ]);

  const categoryCounts = Object.fromEntries(
    categorySlugs.map((slug, index) => [slug, rest[index]]),
  ) as Record<string, number>;

  const talleCounts = Object.fromEntries(
    SIZE_OPTIONS.map((size, index) => [
      size,
      rest[categorySlugs.length + index],
    ]),
  ) as Record<string, number>;

  return {
    genero: {
      all: generoAll,
      mujer: generoMujer,
      hombre: generoHombre,
    },
    categoria: categoryCounts,
    categoriaAll,
    talle: talleCounts,
  };
}
