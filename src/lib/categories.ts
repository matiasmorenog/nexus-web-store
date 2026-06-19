export const STORE_AUDIENCES = [
  { slug: "mujer", label: "Mujer" },
  { slug: "hombre", label: "Hombre" },
  { slug: "unisex", label: "Unisex" },
] as const;

export type StoreAudience = (typeof STORE_AUDIENCES)[number]["slug"];

export const PRODUCT_CATEGORIES = [
  {
    slug: "remeras",
    label: "Remeras",
    audiences: ["mujer", "hombre", "unisex"] as const,
  },
  {
    slug: "musculosas",
    label: "Musculosas",
    audiences: ["mujer", "hombre", "unisex"] as const,
  },
  {
    slug: "tops",
    label: "Tops",
    audiences: ["mujer"] as const,
  },
  {
    slug: "leggings",
    label: "Calzas",
    audiences: ["mujer", "unisex"] as const,
  },
  {
    slug: "shorts",
    label: "Shorts",
    audiences: ["mujer", "hombre", "unisex"] as const,
  },
  {
    slug: "hoodies",
    label: "Buzos",
    audiences: ["mujer", "hombre", "unisex"] as const,
  },
  {
    slug: "accesorios",
    label: "Accesorios",
    audiences: ["mujer", "hombre", "unisex"] as const,
  },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["slug"];

/** @deprecated Usar PRODUCT_CATEGORIES; se mantiene por compatibilidad en admin. */
export const STORE_CATEGORIES = PRODUCT_CATEGORIES;

export type StoreCategory = ProductCategory;

export function categoriesForStoreFilter(genero?: string) {
  if (!genero) return PRODUCT_CATEGORIES;

  return PRODUCT_CATEGORIES.filter((category) =>
    (category.audiences as readonly string[]).includes(genero),
  );
}

export const HOME_GENDER_TILES = [
  { slug: "mujer", label: "Mujer", href: "/productos?genero=mujer" },
  { slug: "hombre", label: "Hombre", href: "/productos?genero=hombre" },
] as const;

export const HOME_PRODUCT_CATEGORY_TILES = PRODUCT_CATEGORIES.map((category) => ({
  slug: category.slug,
  label: category.label,
  href: `/productos?categoria=${category.slug}`,
}));

export const HOME_CATEGORY_TILES = [
  ...HOME_GENDER_TILES,
  ...HOME_PRODUCT_CATEGORY_TILES,
] as const;

export function categoriesForAudience(audience: StoreAudience) {
  return PRODUCT_CATEGORIES.filter((category) =>
    (category.audiences as readonly string[]).includes(audience),
  );
}

export function getAudienceLabel(slug: string) {
  return STORE_AUDIENCES.find((audience) => audience.slug === slug)?.label ?? slug;
}

export function getCategoryLabel(slug: string) {
  return PRODUCT_CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
}

export function getProductTaxonomyLabel(category: string, audience: string) {
  const categoryLabel = getCategoryLabel(category);
  if (audience === "unisex") return categoryLabel;
  return `${categoryLabel} · ${getAudienceLabel(audience)}`;
}

export function audiencesForProductFilter(genero: string | undefined) {
  if (genero === "mujer") return ["mujer", "unisex"];
  if (genero === "hombre") return ["hombre", "unisex"];
  return undefined;
}

export type HeaderNavMatch =
  | { type: "home" }
  | { type: "catalog" }
  | { type: "genero"; slug: Exclude<StoreAudience, "unisex"> }
  | { type: "categoria"; slug: ProductCategory };

export type HeaderNavLink = {
  href: string;
  label: string;
  match: HeaderNavMatch;
};

function navGenero(slug: Exclude<StoreAudience, "unisex">): HeaderNavLink {
  return {
    href: `/productos?genero=${slug}`,
    label: getAudienceLabel(slug),
    match: { type: "genero", slug },
  };
}

function navCategoria(slug: ProductCategory): HeaderNavLink {
  return {
    href: `/productos?categoria=${slug}`,
    label: getCategoryLabel(slug),
    match: { type: "categoria", slug },
  };
}

/** Género + categorías más buscadas; entra en desktop sin saturar. */
export const HEADER_NAV_DESKTOP: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  navGenero("mujer"),
  navGenero("hombre"),
  navCategoria("remeras"),
  navCategoria("leggings"),
  navCategoria("shorts"),
  navCategoria("accesorios"),
];

/** Catálogo completo en menú móvil. */
export const HEADER_NAV_MOBILE: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  { href: "/productos", label: "Catálogo", match: { type: "catalog" } },
  navGenero("mujer"),
  navGenero("hombre"),
  ...PRODUCT_CATEGORIES.map((category) => navCategoria(category.slug)),
];

export function isStorefrontNavActive(
  match: HeaderNavMatch,
  pathname: string,
  params: { genero: string | null; categoria: string | null },
) {
  if (match.type === "home") {
    return pathname === "/";
  }

  if (pathname !== "/productos") return false;

  if (match.type === "catalog") {
    return !params.genero && !params.categoria;
  }

  if (match.type === "genero") {
    return params.genero === match.slug && !params.categoria;
  }

  return params.categoria === match.slug && !params.genero;
}
