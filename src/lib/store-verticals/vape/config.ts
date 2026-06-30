import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";

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

export const vapeConfig: VerticalConfig = {
  id: "vape",
  storefrontMode: "home-only",
  brandSuffix: "",
  metadata: {
    description:
      "Vapers, líquidos y accesorios. Productos seleccionados para tu experiencia.",
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
    cssVars: {
      "--brand-primary": "#22c55e",
      "--ui-button-radius": "9999px",
      "--ui-button-primary-shadow":
        "0 0 20px color-mix(in srgb, var(--brand-primary) 35%, transparent)",
      "--ui-button-font-weight": "600",
    },
  },
  productCategories: VAPE_PRODUCT_CATEGORIES,
  audiences: [{ slug: "unisex", label: "Unisex" }],
  headerNavDesktop: [
    { href: "/", label: "Inicio", match: { type: "home" } },
    { href: "/contacto", label: "Contacto", match: { type: "contact" } },
  ],
  headerNavMobile: [
    { href: "/", label: "Inicio", match: { type: "home" } },
    { href: "/contacto", label: "Contacto", match: { type: "contact" } },
  ],
  home: {
    showAllProducts: true,
    productsSectionTitle: "Nuestros productos",
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
