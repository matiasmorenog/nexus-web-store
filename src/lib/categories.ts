import {
  audiencesForProductFilter as audiencesForProductFilterBase,
  categoriesForAudienceFilter,
  categoriesForStoreFilter as categoriesForStoreFilterBase,
  getCategoryLabelFromList,
  getProductTaxonomyLabel as taxonomyLabel,
} from "@/lib/store-verticals/taxonomy";
import { getStorefrontConfig } from "@/lib/store-verticals";
import { APP1_PRODUCT_CATEGORIES } from "@/lib/store-verticals/app1/config";

export const STORE_AUDIENCES = [
  { slug: "hombre", label: "Hombre" },
  { slug: "mujer", label: "Mujer" },
  { slug: "unisex", label: "Unisex" },
] as const;

export type StoreAudience = (typeof STORE_AUDIENCES)[number]["slug"];

export const PRODUCT_CATEGORIES = APP1_PRODUCT_CATEGORIES;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["slug"];

/** @deprecated Usar PRODUCT_CATEGORIES; se mantiene por compatibilidad en admin. */
export const STORE_CATEGORIES = PRODUCT_CATEGORIES;

export type StoreCategory = ProductCategory;

export function categoriesForStoreFilter(genero?: string) {
  const config = getStorefrontConfig();
  return categoriesForStoreFilterBase(config.productCategories, genero);
}

export const HOME_GENDER_TILES = [
  { slug: "hombre", label: "Hombre", href: "/productos?genero=hombre" },
  { slug: "mujer", label: "Mujer", href: "/productos?genero=mujer" },
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
  const config = getStorefrontConfig();
  return categoriesForAudienceFilter(config.productCategories, audience);
}

export function getAudienceLabel(slug: string) {
  const config = getStorefrontConfig();
  return config.audiences.find((audience) => audience.slug === slug)?.label ?? slug;
}

export function getCategoryLabel(slug: string) {
  const config = getStorefrontConfig();
  return getCategoryLabelFromList(config.productCategories, slug);
}

export function getProductTaxonomyLabel(category: string, audience: string) {
  const config = getStorefrontConfig();
  return taxonomyLabel(
    config.productCategories,
    config.audiences,
    category,
    audience,
  );
}

export { audiencesForProductFilterBase as audiencesForProductFilter };

export type { HeaderNavLink, HeaderNavMatch } from "@/lib/store-verticals/nav";
export {
  isStorefrontNavActive,
} from "@/lib/store-verticals/nav";

function navGenero(slug: Exclude<StoreAudience, "unisex">) {
  return {
    href: `/productos?genero=${slug}`,
    label: getAudienceLabel(slug),
    match: { type: "genero" as const, slug },
  };
}

function navCategoria(slug: ProductCategory) {
  return {
    href: `/productos?categoria=${slug}`,
    label: getCategoryLabel(slug),
    match: { type: "categoria" as const, slug },
  };
}

function navDestacados() {
  return {
    href: "/productos?destacados=1",
    label: "Destacados",
    match: { type: "destacados" as const },
  };
}

function navPromo2x1() {
  return {
    href: "/productos?promo=2x1",
    label: "Sale",
    match: { type: "promo2x1" as const },
    accent: "promo2x1" as const,
  };
}

/** Género + promos + categorías clave; entra en desktop sin saturar. */
export const HEADER_NAV_DESKTOP = [
  { href: "/", label: "Inicio", match: { type: "home" as const } },
  navGenero("hombre"),
  navGenero("mujer"),
  navDestacados(),
  navCategoria("accesorios"),
  navPromo2x1(),
];

/** Catálogo completo en menú móvil. */
export const HEADER_NAV_MOBILE = [
  { href: "/", label: "Inicio", match: { type: "home" as const } },
  { href: "/productos", label: "Catálogo", match: { type: "catalog" as const } },
  navGenero("hombre"),
  navGenero("mujer"),
  navDestacados(),
  ...PRODUCT_CATEGORIES.map((category) => navCategoria(category.slug)),
  navPromo2x1(),
];
