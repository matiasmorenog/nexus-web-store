import {
  audiencesForProductFilter as audiencesForProductFilterBase,
  categoriesForAudienceFilter,
  categoriesForStoreFilter as categoriesForStoreFilterBase,
  getCategoryLabelFromList,
  getProductTaxonomyLabel as taxonomyLabel,
} from "@/lib/store-verticals/taxonomy";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { APP1_PRODUCT_CATEGORIES } from "@/lib/store-verticals/app1/config";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";

export const STORE_AUDIENCES = [
  { slug: "hombre", label: "Hombre" },
  { slug: "mujer", label: "Mujer" },
  { slug: "unisex", label: "Unisex" },
] as const;

export type StoreAudience = (typeof STORE_AUDIENCES)[number]["slug"];

export const PRODUCT_CATEGORIES = APP1_PRODUCT_CATEGORIES;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["slug"];

/** @deprecated Usar ProductCategorySlug. */
export type ProductCategory = ProductCategorySlug;

/** @deprecated Usar PRODUCT_CATEGORIES o getStoreCategories(). */
export const STORE_CATEGORIES = PRODUCT_CATEGORIES;

function resolveCategories(
  categories?: readonly ProductCategoryDef[],
): readonly ProductCategoryDef[] {
  return categories ?? getClientStorefrontConfig().productCategories;
}

export function categoriesForStoreFilter(
  genero?: string,
  categories?: readonly ProductCategoryDef[],
) {
  return categoriesForStoreFilterBase(resolveCategories(categories), genero);
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

export function categoriesForAudience(
  audience: StoreAudience,
  categories?: readonly ProductCategoryDef[],
) {
  return categoriesForAudienceFilter(resolveCategories(categories), audience);
}

export function getAudienceLabel(slug: string) {
  const config = getClientStorefrontConfig();
  return config.audiences.find((audience) => audience.slug === slug)?.label ?? slug;
}

export function getCategoryLabel(
  slug: string,
  categories?: readonly ProductCategoryDef[],
) {
  return getCategoryLabelFromList(resolveCategories(categories), slug);
}

export function getProductTaxonomyLabel(
  category: string,
  audience: string,
  categories?: readonly ProductCategoryDef[],
) {
  const config = getClientStorefrontConfig();
  return taxonomyLabel(
    resolveCategories(categories),
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

function navDestacados() {
  return {
    href: "/productos?destacados=1",
    label: "Destacados",
    match: { type: "destacados" as const },
  };
}

/** Allowlist corto Goat (app1): sin categorías de prenda. */
export const HEADER_NAV_DESKTOP = [
  { href: "/", label: "Inicio", match: { type: "home" as const } },
  navGenero("hombre"),
  navGenero("mujer"),
  navDestacados(),
];

/** Misma lista corta que desktop (menú móvil Goat). */
export const HEADER_NAV_MOBILE = [
  { href: "/", label: "Inicio", match: { type: "home" as const } },
  navGenero("hombre"),
  navGenero("mujer"),
  navDestacados(),
];
