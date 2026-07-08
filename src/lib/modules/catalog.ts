import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

export const BASE_PLAN = {
  name: "Plan Base",
  monthlyPriceUsd: 100,
  description:
    "Dashboard, productos, pedidos, configuración, checkout y emails transaccionales.",
} as const;

const MODULE_LIST = [
  {
    id: "coupons",
    name: "Cupones y promociones",
    description:
      "Códigos de descuento, reglas por categoría y promociones avanzadas en checkout.",
    monthlyPriceUsd: 20,
    category: "marketing",
    adminRoutes: ["/admin/cupones"],
    storefrontSurfaces: ["checkout"],
  },
  {
    id: "homeEditor",
    name: "Home editable",
    description:
      "Banners, hero y secciones de la home sin tocar código ni redeploy.",
    monthlyPriceUsd: 25,
    category: "marketing",
    adminRoutes: ["/admin/home"],
    storefrontSurfaces: ["home"],
  },
  {
    id: "analytics",
    name: "Analytics avanzado",
    description:
      "Funnels, cohortes, comparación de períodos y métricas de conversión.",
    monthlyPriceUsd: 30,
    category: "operations",
    adminRoutes: ["/admin/analytics"],
  },
  {
    id: "crm",
    name: "CRM lite",
    description:
      "Ficha de clientes, historial de compras, tags y notas internas.",
    monthlyPriceUsd: 25,
    category: "operations",
    adminRoutes: ["/admin/clientes"],
  },
  {
    id: "shippingCarriers",
    name: "Envíos carrier",
    description:
      "Cotización y etiquetas con operadores logísticos (Andreani, OCA, etc.).",
    monthlyPriceUsd: 40,
    category: "operations",
    adminRoutes: ["/admin/envios"],
    storefrontSurfaces: ["checkout"],
  },
  {
    id: "marketing",
    name: "WhatsApp y Meta Pixel",
    description:
      "Botón de WhatsApp, pixel de conversión y eventos de checkout.",
    monthlyPriceUsd: 20,
    category: "marketing",
    adminRoutes: ["/admin/marketing"],
    storefrontSurfaces: ["layout"],
  },
  {
    id: "multiUser",
    name: "Multi-usuario",
    description:
      "Usuarios adicionales con roles (vendedor, depósito, solo lectura).",
    monthlyPriceUsd: 18,
    category: "operations",
    adminRoutes: ["/admin/usuarios"],
  },
  {
    id: "api",
    name: "API y webhooks",
    description:
      "REST para productos y pedidos, webhooks de eventos de la tienda.",
    monthlyPriceUsd: 50,
    category: "integrations",
    adminRoutes: ["/admin/api"],
  },
  {
    id: "premiumThemes",
    name: "Temas premium",
    description: "Temas visuales adicionales para diferenciar tu marca.",
    monthlyPriceUsd: 15,
    category: "storefront",
    adminRoutes: ["/admin/temas"],
    storefrontSurfaces: ["layout"],
  },
  {
    id: "seo",
    name: "SEO avanzado",
    description:
      "Sitemap dinámico, meta por página y structured data para buscadores.",
    monthlyPriceUsd: 15,
    category: "marketing",
    adminRoutes: ["/admin/seo"],
    storefrontSurfaces: ["layout"],
  },
  {
    id: "exports",
    name: "Export y reportes",
    description: "Export CSV de pedidos y productos, reportes para contabilidad.",
    monthlyPriceUsd: 12,
    category: "operations",
    adminRoutes: ["/admin/exportaciones"],
  },
  {
    id: "wishlist",
    name: "Wishlist",
    description: "Lista de deseos en storefront y cuenta del cliente.",
    monthlyPriceUsd: 10,
    category: "storefront",
    adminRoutes: ["/admin/wishlist"],
    storefrontSurfaces: ["account", "pdp"],
  },
] as const satisfies readonly ModuleDefinition[];

export const MODULE_CATALOG = Object.fromEntries(
  MODULE_LIST.map((module) => [module.id, module]),
) as Record<(typeof MODULE_LIST)[number]["id"], (typeof MODULE_LIST)[number]>;

export type ModuleId = keyof typeof MODULE_CATALOG;

export const MODULE_IDS = MODULE_LIST.map((m) => m.id) as ModuleId[];

export const MODULE_CATEGORY_LABELS: Record<ModuleCategory, string> = {
  marketing: "Marketing",
  operations: "Operaciones",
  integrations: "Integraciones",
  storefront: "Storefront",
};

export function isModuleId(value: string): value is ModuleId {
  return value in MODULE_CATALOG;
}

export function getModuleDefinition(moduleId: ModuleId) {
  return MODULE_CATALOG[moduleId];
}

export function listModulesByCategory() {
  const groups = new Map<ModuleCategory, (typeof MODULE_LIST)[number][]>();

  for (const moduleEntry of MODULE_LIST) {
    const list = groups.get(moduleEntry.category) ?? [];
    list.push(moduleEntry);
    groups.set(moduleEntry.category, list);
  }

  return Array.from(groups.entries()).map(([category, modules]) => ({
    category,
    label: MODULE_CATEGORY_LABELS[category],
    modules,
  }));
}

export function estimateMonthlyTotal(enabledModuleIds: readonly ModuleId[]) {
  const modulesTotal = enabledModuleIds.reduce(
    (sum, id) => sum + MODULE_CATALOG[id].monthlyPriceUsd,
    0,
  );
  return BASE_PLAN.monthlyPriceUsd + modulesTotal;
}
