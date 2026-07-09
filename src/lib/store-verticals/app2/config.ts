import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";
import { app2CssVars, app2Palette } from "@/lib/store-verticals/app2/theme";

export { app2Palette };

export const APP2_PRODUCT_CATEGORIES = [
  { slug: "kits", label: "Kits y dispositivos" },
  { slug: "liquidos", label: "Líquidos" },
  { slug: "pods", label: "Pods y cartuchos" },
  { slug: "descartables", label: "Descartables" },
  { slug: "accesorios", label: "Accesorios" },
] as const;

const APP2_PRICE_TIERS = [
  { value: "5000", label: "Hasta $5.000" },
  { value: "15000", label: "Hasta $15.000" },
  { value: "30000", label: "Hasta $30.000" },
] as const;

function navCategoria(
  slug: string,
  label: string,
  navKey?: string,
): HeaderNavLink {
  return {
    href: `/productos?categoria=${slug}`,
    label,
    match: { type: "categoria", slug },
    ...(navKey ? { navKey } : {}),
  };
}

const APP2_HEADER_NAV_DESKTOP: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  navCategoria("kits", "Dispositivos", "dispositivos"),
  navCategoria("liquidos", "Líquidos", "liquidos"),
  navCategoria("pods", "Pods", "pods"),
  navCategoria("accesorios", "Accesorios", "accesorios"),
  {
    href: "/productos?destacados=1",
    label: "Ofertas",
    match: { type: "destacados" },
    navKey: "ofertas",
  },
];

const APP2_HEADER_NAV_MOBILE: HeaderNavLink[] = [
  { href: "/", label: "Inicio", match: { type: "home" } },
  { href: "/productos", label: "Productos", match: { type: "catalog" } },
  {
    href: "/productos?destacados=1",
    label: "Ofertas",
    match: { type: "destacados" },
    navKey: "ofertas",
  },
  { href: "/contacto", label: "Contacto", match: { type: "contact" } },
];

export const app2Config: VerticalConfig = {
  id: "app2",
  storefrontMode: "full",
  metadata: {
    description:
      "Tu tienda de confianza para vapes premium. Envío seguro y productos seleccionados.",
  },
  features: {
    catalog: true,
    catalogFilters: true,
    productSearch: true,
    // 2x1 disponible como addon (módulo coupons). Off hoy porque app2 está en
    // plan base; se activa al habilitar el módulo + toggle en admin.
    promo2x1: true,
    promoBanner: true,
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
    id: "app2",
    cssVars: app2CssVars,
  },
  productCategories: APP2_PRODUCT_CATEGORIES,
  audiences: [{ slug: "unisex", label: "Unisex" }],
  headerNavDesktop: APP2_HEADER_NAV_DESKTOP,
  headerNavMobile: APP2_HEADER_NAV_MOBILE,
  home: {
    showAllProducts: false,
    productsSectionTitle: "DESTACADOS",
  },
  catalogFacets: [
    { param: "categoria", type: "category", label: "Categoría" },
    { param: "nicotina", type: "variantSize", label: "Nicotina" },
    { param: "sabor", type: "variantColor", label: "Sabor" },
    {
      param: "precioMax",
      type: "priceMax",
      label: "Precio máximo",
      priceTiers: APP2_PRICE_TIERS,
    },
    { param: "destacados", type: "featured", label: "Destacados" },
  ],
};

export function app2CatalogHref(categoria?: string) {
  if (!categoria) return "/productos";
  return `/productos?categoria=${encodeURIComponent(categoria)}`;
}
