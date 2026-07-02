import type { HeaderNavLink } from "@/lib/store-verticals/nav";

export type StoreVertical = "apparel" | "vape";

export type StorefrontMode = "full" | "home-only";

export type ProductCategoryDef = {
  slug: string;
  label: string;
  audiences?: readonly string[];
};

export type VariantLabels = {
  /** Segundo eje de variante en UI (talle / nicotina). */
  secondary: string;
  /** Primer eje de variante en UI (color / sabor). */
  primary: string;
  secondaryInitial?: string;
  primaryInitial?: string;
};

export type VerticalFeatures = {
  catalog: boolean;
  catalogFilters: boolean;
  productSearch: boolean;
  promo2x1: boolean;
  promoBanner: boolean;
  categoryTilesOnHome: boolean;
  showAudienceFilter: boolean;
  sizeGuide: boolean;
  ageNotice: boolean;
};

export type StorefrontUiTokens = {
  id: string;
  cssVars: Record<string, string>;
};

export type VerticalHomeConfig = {
  showAllProducts: boolean;
  productsSectionTitle: string;
};

export type CatalogFacetType =
  | "audience"
  | "category"
  | "variantSize"
  | "variantColor"
  | "priceMax"
  | "featured"
  | "promo2x1";

export type CatalogFacetDef = {
  param: string;
  type: CatalogFacetType;
  label: string;
  /** Opciones fijas (ej. talles XS–XL). Si omitido, se derivan del índice. */
  options?: readonly string[];
  priceTiers?: readonly { value: string; label: string }[];
};

export type VerticalConfig = {
  id: StoreVertical;
  storefrontMode: StorefrontMode;
  /** Línea secundaria del logo (ej. «Indumentaria» bajo «Goat»). No se concatena al nombre en DB. */
  brandLogoAccent?: string;
  metadata: { description: string };
  features: VerticalFeatures;
  variantLabels: VariantLabels;
  ui: StorefrontUiTokens;
  productCategories: readonly ProductCategoryDef[];
  audiences: readonly { slug: string; label: string }[];
  headerNavDesktop: HeaderNavLink[];
  headerNavMobile: HeaderNavLink[];
  home: VerticalHomeConfig;
  catalogFacets: readonly CatalogFacetDef[];
};
