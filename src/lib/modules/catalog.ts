import type { ModuleCategory, ModuleDefinition } from "@/lib/modules/types";

/** Núcleo operativo incluido en todos los planes (sin ID de módulo). */
export const PLAN_CORE = {
  name: "Núcleo",
  description:
    "Dashboard, productos, pedidos, cobros, configuración, checkout y emails transaccionales.",
  features: [
    "Dashboard y KPIs",
    "Catálogo y gestión de productos",
    "Gestión de pedidos",
    "Cobros (Mercado Pago y transferencia)",
    "Configuración de la tienda",
    "Checkout para tus clientes",
    "Emails transaccionales",
    "1 owner por tienda",
  ],
} as const;

/** @deprecated Usar PLAN_CORE + PLAN_TIERS. Alias para UI legacy. */
export const BASE_PLAN = {
  name: PLAN_CORE.name,
  monthlyPriceUsd: 0,
  description: PLAN_CORE.description,
  features: PLAN_CORE.features,
} as const;

export type PlanTierId = "start" | "grow" | "pro";

const MODULE_LIST = [
  {
    id: "coupons",
    name: "Cupones y promociones",
    description:
      "Códigos de descuento, reglas por categoría y promociones avanzadas en checkout.",
    monthlyPriceUsd: 0,
    includedInPlans: ["grow", "pro"],
    category: "marketing",
    adminRoutes: ["/admin/cupones"],
    storefrontSurfaces: ["checkout"],
  },
  {
    id: "homeEditor",
    name: "Home editable",
    description:
      "Banners, hero y secciones de la home sin tocar código ni redeploy.",
    monthlyPriceUsd: 0,
    includedInPlans: ["grow", "pro"],
    category: "marketing",
    adminRoutes: ["/admin/home"],
    storefrontSurfaces: ["home"],
  },
  {
    id: "analytics",
    name: "Analytics y reportes",
    description:
      "Comparación de períodos, embudo, clientes fieles, tops y export CSV (reporte, pedidos y catálogo).",
    monthlyPriceUsd: 0,
    includedInPlans: ["pro"],
    category: "operations",
    adminRoutes: ["/admin/modulos/analytics"],
  },
  {
    id: "crm",
    name: "CRM lite",
    description:
      "Ficha de clientes, historial de compras, tags y notas internas.",
    monthlyPriceUsd: 0,
    includedInPlans: ["grow", "pro"],
    category: "operations",
    adminRoutes: ["/admin/clientes"],
  },
  {
    id: "shippingCarriers",
    name: "Envíos carrier",
    description:
      "Cotización y etiquetas con operadores logísticos (Andreani, OCA, etc.).",
    monthlyPriceUsd: 0,
    includedInPlans: ["grow", "pro"],
    category: "operations",
    adminRoutes: ["/admin/envios"],
    storefrontSurfaces: ["checkout"],
  },
  {
    id: "marketing",
    name: "WhatsApp y Meta Pixel",
    description:
      "Botón de WhatsApp, pixel de conversión y eventos de checkout.",
    monthlyPriceUsd: 0,
    includedInPlans: ["start", "grow", "pro"],
    category: "marketing",
    adminRoutes: ["/admin/marketing"],
    storefrontSurfaces: ["layout"],
  },
  {
    id: "multiUser",
    name: "Multi-usuario",
    description:
      "Usuarios adicionales con roles (administrador, vendedor, depósito, solo lectura).",
    monthlyPriceUsd: 0,
    includedInPlans: ["grow", "pro"],
    category: "operations",
    adminRoutes: ["/admin/usuarios"],
  },
  {
    id: "api",
    name: "API y webhooks",
    description:
      "REST para productos y pedidos, webhooks de eventos de la tienda.",
    monthlyPriceUsd: 0,
    includedInPlans: ["pro"],
    category: "integrations",
    adminRoutes: ["/admin/api"],
  },
  {
    id: "seo",
    name: "SEO avanzado",
    description:
      "Sitemap dinámico, meta por página y structured data para buscadores.",
    monthlyPriceUsd: 0,
    includedInPlans: ["start", "grow", "pro"],
    category: "marketing",
    adminRoutes: ["/admin/seo"],
    storefrontSurfaces: ["layout"],
  },
  {
    id: "wishlist",
    name: "Wishlist",
    description: "Lista de deseos en la tienda y cuenta del cliente.",
    monthlyPriceUsd: 0,
    includedInPlans: ["grow", "pro"],
    category: "storefront",
    adminRoutes: ["/admin/wishlist"],
    storefrontSurfaces: ["account", "pdp"],
  },
] satisfies readonly ModuleDefinition[];

export const MODULE_CATALOG = Object.fromEntries(
  MODULE_LIST.map((module) => [module.id, module]),
) as Record<(typeof MODULE_LIST)[number]["id"], ModuleDefinition>;

export type ModuleId = keyof typeof MODULE_CATALOG;

export type PlanTierDefinition = {
  id: PlanTierId;
  name: string;
  monthlyPriceUsd: number;
  /** Precio mensual equivalente con pago anual (−20%). */
  annualMonthlyUsd: number;
  description: string;
  target: string;
  moduleIds: readonly ModuleId[];
  /** Límite de staff adicionales (owner no cuenta). null = alto / ilimitado. */
  maxStaffSeats: number | null;
};

export const MODULE_IDS = MODULE_LIST.map((m) => m.id) as ModuleId[];

const START_MODULE_IDS = MODULE_IDS.filter((id) =>
  MODULE_CATALOG[id].includedInPlans.includes("start"),
);

const GROW_MODULE_IDS = MODULE_IDS.filter((id) =>
  MODULE_CATALOG[id].includedInPlans.includes("grow"),
);

const PRO_MODULE_IDS = MODULE_IDS.filter((id) =>
  MODULE_CATALOG[id].includedInPlans.includes("pro"),
);

export const PLAN_TIERS: Record<PlanTierId, PlanTierDefinition> = {
  start: {
    id: "start",
    name: "Start",
    monthlyPriceUsd: 29,
    annualMonthlyUsd: 23,
    description: "Vendé online con marketing básico y SEO.",
    target: "Emprende / Instagram → web",
    moduleIds: START_MODULE_IDS,
    maxStaffSeats: 0,
  },
  grow: {
    id: "grow",
    name: "Grow",
    monthlyPriceUsd: 59,
    annualMonthlyUsd: 47,
    description: "Promos, home, envíos, CRM y equipo chico.",
    target: "Marca que ya vende",
    moduleIds: GROW_MODULE_IDS,
    maxStaffSeats: 2,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPriceUsd: 99,
    annualMonthlyUsd: 79,
    description: "Analytics, API y operación con más usuarios.",
    target: "Equipo + integraciones",
    moduleIds: PRO_MODULE_IDS,
    maxStaffSeats: null,
  },
};

export const PLAN_TIER_IDS = Object.keys(PLAN_TIERS) as PlanTierId[];

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

/** Tier mínimo que incluye el módulo. */
export function getModuleMinPlan(moduleId: ModuleId): PlanTierId {
  const plans = MODULE_CATALOG[moduleId].includedInPlans;
  if (plans.includes("start")) return "start";
  if (plans.includes("grow")) return "grow";
  return "pro";
}

/**
 * Inferí el tier comercial desde módulos activos.
 * Vacío (demo `none`) → Start como piso comercial.
 */
export function resolvePlanTier(
  enabledModuleIds: readonly ModuleId[],
): PlanTierDefinition {
  if (
    enabledModuleIds.some((id) => getModuleMinPlan(id) === "pro")
  ) {
    return PLAN_TIERS.pro;
  }
  if (
    enabledModuleIds.some((id) => getModuleMinPlan(id) === "grow")
  ) {
    return PLAN_TIERS.grow;
  }
  return PLAN_TIERS.start;
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

/** Precio mensual del tier inferido (no suma de módulos). */
export function estimateMonthlyTotal(enabledModuleIds: readonly ModuleId[]) {
  return resolvePlanTier(enabledModuleIds).monthlyPriceUsd;
}
