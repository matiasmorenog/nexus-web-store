import type { HeaderNavLink } from "@/lib/store-verticals/nav";
import type { VerticalConfig } from "@/lib/store-verticals/types";

export const APP3_PRODUCT_CATEGORIES = [
  { slug: "portachiavi", label: "Portachiavi" },
  { slug: "candele", label: "Candele" },
  { slug: "saponi", label: "Saponi" },
  { slug: "decorazioni", label: "Decorazioni" },
  { slug: "regali-personalizzati", label: "Regali personalizzati" },
] as const;

const navCategoria = (slug: string, label: string): HeaderNavLink => ({
  href: `/productos?categoria=${slug}`,
  label,
  match: { type: "categoria", slug },
});

const APP3_PRICE_TIERS = [
  { value: "15", label: "Fino a 15 €" },
  { value: "30", label: "Fino a 30 €" },
  { value: "50", label: "Fino a 50 €" },
] as const;

export const app3Config: VerticalConfig = {
  id: "app3",
  locale: "it-IT",
  currency: "EUR",
  storefrontMode: "full",
  brandLogoAccent: "atelier fatto a mano",
  metadata: {
    description:
      "Regali personalizzati e creazioni artigianali. Ogni materia prende vita, fatta a mano per te.",
  },
  features: {
    checkout: false,
    catalog: true,
    catalogFilters: true,
    productSearch: true,
    promo2x1: false,
    promoBanner: false,
    categoryTilesOnHome: true,
    showAudienceFilter: false,
    sizeGuide: false,
    ageNotice: false,
  },
  variantLabels: {
    primary: "Finitura",
    secondary: "Formato",
    primaryInitial: "Personalizzato",
    secondaryInitial: "Unico",
  },
  ui: {
    id: "app3",
    cssVars: {
      "--brand-primary": "#2351D1",
      "--brand-primary-soft": "#E9EEFC",
      "--brand-primary-light": "#7390E5",
      "--brand-primary-darker": "#202523",
      "--storefront-bg": "#F2F0E9",
      "--ui-button-radius": "999px",
      "--ui-button-primary-shadow": "0 10px 28px rgba(35,81,209,.2)",
      "--ui-button-font-weight": "600",
    },
  },
  productCategories: APP3_PRODUCT_CATEGORIES,
  audiences: [{ slug: "unisex", label: "Tutti" }],
  headerNavDesktop: [
    { href: "/", label: "Home", match: { type: "home" } },
    navCategoria("portachiavi", "Portachiavi"),
    navCategoria("candele", "Candele"),
    navCategoria("saponi", "Saponi"),
    navCategoria("regali-personalizzati", "Su misura"),
    { href: "/contacto", label: "Contatti", match: { type: "contact" } },
  ],
  headerNavMobile: [
    { href: "/", label: "Home", match: { type: "home" } },
    { href: "/productos", label: "Collezione", match: { type: "catalog" } },
    ...APP3_PRODUCT_CATEGORIES.map((category) =>
      navCategoria(category.slug, category.label),
    ),
    { href: "/contacto", label: "Contatti", match: { type: "contact" } },
  ],
  home: {
    showAllProducts: false,
    productsSectionTitle: "Creazioni in evidenza",
  },
  catalogFacets: [
    { param: "categoria", type: "category", label: "Categoria" },
    {
      param: "talle",
      type: "variantSize",
      label: "Formato",
    },
    {
      param: "precioMax",
      type: "priceMax",
      label: "Prezzo massimo",
      priceTiers: APP3_PRICE_TIERS,
    },
    { param: "destacados", type: "featured", label: "In evidenza" },
  ],
};
