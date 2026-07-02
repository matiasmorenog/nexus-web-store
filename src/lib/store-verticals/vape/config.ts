import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";
import { vapeCssVars, vapePalette } from "@/lib/store-verticals/vape/theme";

export { vapePalette };

export const VAPE_PRODUCT_CATEGORIES = [
  { slug: "kits", label: "Kits y dispositivos" },
  { slug: "liquidos", label: "Líquidos" },
  { slug: "pods", label: "Pods y cartuchos" },
  { slug: "descartables", label: "Descartables" },
  { slug: "accesorios", label: "Accesorios" },
] as const;

const VAPE_PRICE_TIERS = [
  { value: "5000", label: "Hasta $5.000" },
  { value: "15000", label: "Hasta $15.000" },
  { value: "30000", label: "Hasta $30.000" },
] as const;

export const vapeConfig: VerticalConfig = {
  id: "vape",
  storefrontMode: "home-only",
  metadata: {
    description:
      "Tu tienda de confianza para vapes premium. Envío seguro y productos seleccionados.",
  },
  features: {
    catalog: false,
    catalogFilters: false,
    productSearch: false,
    promo2x1: false,
    promoBanner: false,
    categoryTilesOnHome: false,
    showAudienceFilter: false,
    sizeGuide: false,
    ageNotice: true,
  },
  variantLabels: {
    primary: "Sabor",
    secondary: "Nicotina",
    primaryInitial: "Mango",
    secondaryInitial: "35mg",
  },
  ui: {
    id: "vape",
    cssVars: vapeCssVars,
  },
  productCategories: VAPE_PRODUCT_CATEGORIES,
  audiences: [{ slug: "unisex", label: "Unisex" }],
  headerNavDesktop: [
    {
      href: "/#categorias",
      label: "Dispositivos",
      match: { type: "hash", hash: "categorias" },
      navKey: "dispositivos",
    },
    {
      href: "/#categorias",
      label: "Líquidos",
      match: { type: "hash", hash: "categorias" },
      navKey: "liquidos",
    },
    {
      href: "/#categorias",
      label: "Pods",
      match: { type: "hash", hash: "categorias" },
      navKey: "pods",
    },
    {
      href: "/#categorias",
      label: "Accesorios",
      match: { type: "hash", hash: "categorias" },
      navKey: "accesorios",
    },
    {
      href: "/#ofertas",
      label: "Ofertas",
      match: { type: "hash", hash: "ofertas" },
      navKey: "ofertas",
    },
  ],
  headerNavMobile: [
    {
      href: "/#categorias",
      label: "Categorías",
      match: { type: "hash", hash: "categorias" },
      navKey: "categorias",
    },
    {
      href: "/#productos-vape",
      label: "Productos",
      match: { type: "hash", hash: "productos-vape" },
      navKey: "productos",
    },
    {
      href: "/#ofertas",
      label: "Ofertas",
      match: { type: "hash", hash: "ofertas" },
      navKey: "ofertas",
    },
    { href: "/contacto", label: "Contacto", match: { type: "contact" } },
  ],
  home: {
    showAllProducts: true,
    productsSectionTitle: "PRODUCTOS DESTACADOS",
  },
  catalogFacets: [
    { param: "categoria", type: "category", label: "Categoría" },
    { param: "nicotina", type: "variantSize", label: "Nicotina" },
    { param: "sabor", type: "variantColor", label: "Sabor" },
    {
      param: "precioMax",
      type: "priceMax",
      label: "Precio máximo",
      priceTiers: VAPE_PRICE_TIERS,
    },
    { param: "destacados", type: "featured", label: "Destacados" },
  ],
};

const VAPE_CATALOG_NAV: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  { href: "/productos", label: "Productos", match: { type: "catalog" } },
  { href: "/contacto", label: "Contacto", match: { type: "contact" } },
];

/** Fase 2: catálogo público cuando `VAPE_STOREFRONT_MODE=full` en el deploy vape. */
export function withVapeCatalogFull(base: VerticalConfig): VerticalConfig {
  return {
    ...base,
    storefrontMode: "full",
    features: {
      ...base.features,
      catalog: true,
      catalogFilters: true,
      productSearch: true,
    },
    headerNavDesktop: VAPE_CATALOG_NAV,
    headerNavMobile: VAPE_CATALOG_NAV,
    home: {
      ...base.home,
      showAllProducts: false,
      productsSectionTitle: "Destacados",
    },
  };
}
