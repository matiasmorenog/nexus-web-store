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

function navCategoria(slug: string, label: string): HeaderNavLink {
  return {
    href: `/productos?categoria=${slug}`,
    label,
    match: { type: "categoria", slug },
  };
}

const VAPE_HEADER_NAV_DESKTOP: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  navCategoria("kits", "Dispositivos"),
  navCategoria("liquidos", "Líquidos"),
  navCategoria("pods", "Pods"),
  navCategoria("accesorios", "Accesorios"),
  {
    href: "/productos?destacados=1",
    label: "Ofertas",
    match: { type: "destacados" },
  },
];

const VAPE_HEADER_NAV_MOBILE: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  { href: "/productos", label: "Productos", match: { type: "catalog" } },
  {
    href: "/productos?destacados=1",
    label: "Ofertas",
    match: { type: "destacados" },
  },
  { href: "/contacto", label: "Contacto", match: { type: "contact" } },
];

export const vapeConfig: VerticalConfig = {
  id: "vape",
  storefrontMode: "full",
  metadata: {
    description:
      "Tu tienda de confianza para vapes premium. Envío seguro y productos seleccionados.",
  },
  features: {
    catalog: true,
    catalogFilters: true,
    productSearch: true,
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
  headerNavDesktop: VAPE_HEADER_NAV_DESKTOP,
  headerNavMobile: VAPE_HEADER_NAV_MOBILE,
  home: {
    showAllProducts: false,
    productsSectionTitle: "Destacados",
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
