import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";

const STORE_AUDIENCES = [
  { slug: "hombre", label: "Hombre" },
  { slug: "mujer", label: "Mujer" },
  { slug: "unisex", label: "Unisex" },
] as const;

export const APPAREL_PRODUCT_CATEGORIES = [
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

function navGenero(slug: "hombre" | "mujer"): HeaderNavLink {
  const label = STORE_AUDIENCES.find((item) => item.slug === slug)?.label ?? slug;
  return {
    href: `/productos?genero=${slug}`,
    label,
    match: { type: "genero", slug },
  };
}

function navCategoria(slug: string, label: string): HeaderNavLink {
  return {
    href: `/productos?categoria=${slug}`,
    label,
    match: { type: "categoria", slug },
  };
}

const APPAREL_PRICE_TIERS = [
  { value: "20000", label: "Hasta $20.000" },
  { value: "35000", label: "Hasta $35.000" },
  { value: "50000", label: "Hasta $50.000" },
] as const;

export const apparelConfig: VerticalConfig = {
  id: "apparel",
  storefrontMode: "full",
  brandSuffix: "Indumentaria",
  metadata: {
    description:
      "Ropa deportiva y CrossFit. Indumentaria para entrenar sin límites.",
  },
  features: {
    catalog: true,
    catalogFilters: true,
    productSearch: true,
    promo2x1: true,
    promoBanner: true,
    categoryTilesOnHome: true,
    showAudienceFilter: true,
    sizeGuide: true,
    ageNotice: false,
  },
  variantLabels: {
    primary: "Color",
    secondary: "Talle",
    primaryInitial: "Negro",
    secondaryInitial: "M",
  },
  ui: {
    id: "apparel",
    cssVars: {
      "--brand-primary": "#f13489",
      "--ui-button-radius": "0.5rem",
      "--ui-button-primary-shadow": "none",
      "--ui-button-font-weight": "500",
    },
  },
  productCategories: APPAREL_PRODUCT_CATEGORIES,
  audiences: STORE_AUDIENCES,
  headerNavDesktop: [
    { href: "/", label: "Inicio", match: { type: "home" } },
    navGenero("hombre"),
    navGenero("mujer"),
    {
      href: "/productos?destacados=1",
      label: "Destacados",
      match: { type: "destacados" },
    },
    navCategoria("accesorios", "Accesorios"),
    {
      href: "/productos?promo=2x1",
      label: "Sale",
      match: { type: "promo2x1" },
      accent: "promo2x1",
    },
  ],
  headerNavMobile: [
    { href: "/", label: "Inicio", match: { type: "home" } },
    { href: "/productos", label: "Catálogo", match: { type: "catalog" } },
    navGenero("hombre"),
    navGenero("mujer"),
    {
      href: "/productos?destacados=1",
      label: "Destacados",
      match: { type: "destacados" },
    },
    ...APPAREL_PRODUCT_CATEGORIES.map((category) =>
      navCategoria(category.slug, category.label),
    ),
    {
      href: "/productos?promo=2x1",
      label: "Sale",
      match: { type: "promo2x1" },
      accent: "promo2x1",
    },
  ],
  home: {
    showAllProducts: false,
    productsSectionTitle: "Destacados",
  },
  catalogFacets: [
    { param: "genero", type: "audience", label: "Género" },
    { param: "categoria", type: "category", label: "Categoría" },
    {
      param: "talle",
      type: "variantSize",
      label: "Talle",
      options: ["XS", "S", "M", "L", "XL"],
    },
    {
      param: "precioMax",
      type: "priceMax",
      label: "Precio máximo",
      priceTiers: APPAREL_PRICE_TIERS,
    },
    { param: "destacados", type: "featured", label: "Destacados" },
    { param: "promo", type: "promo2x1", label: "2x1" },
  ],
};
