import { ADMIN_PLAN_PATH, moduleAdminPath } from "@/lib/modules/access";
import { MODULE_CATALOG, type ModuleId } from "@/lib/modules/catalog";

export type AdminNavIconKey =
  | "dashboard"
  | "products"
  | "orders"
  | "cobros"
  | "config"
  | "plan"
  | ModuleId;

export type AdminCoreNavItem = {
  kind: "core";
  href: string;
  label: string;
  shortLabel: string;
  iconKey: AdminNavIconKey;
  exact?: boolean;
};

export type AdminModuleNavItem = {
  kind: "module";
  moduleId: ModuleId;
  href: string;
  label: string;
  shortLabel: string;
  iconKey: AdminNavIconKey;
  exact?: boolean;
};

export type AdminPlanNavItem = {
  kind: "plan";
  href: typeof ADMIN_PLAN_PATH;
  label: string;
  shortLabel: string;
  iconKey: AdminNavIconKey;
  exact?: boolean;
};

export type AdminNavItem =
  | AdminCoreNavItem
  | AdminModuleNavItem
  | AdminPlanNavItem;

const CORE_NAV_BY_HREF = {
  "/admin": {
    kind: "core" as const,
    href: "/admin",
    label: "Dashboard",
    shortLabel: "Inicio",
    iconKey: "dashboard" as const,
    exact: true,
  },
  "/admin/pedidos": {
    kind: "core" as const,
    href: "/admin/pedidos",
    label: "Pedidos",
    shortLabel: "Pedidos",
    iconKey: "orders" as const,
  },
  "/admin/productos": {
    kind: "core" as const,
    href: "/admin/productos",
    label: "Productos",
    shortLabel: "Productos",
    iconKey: "products" as const,
  },
  "/admin/modulos/cobros": {
    kind: "core" as const,
    href: "/admin/modulos/cobros",
    label: "Cobros",
    shortLabel: "Cobros",
    iconKey: "cobros" as const,
  },
  "/admin/configuracion": {
    kind: "core" as const,
    href: "/admin/configuracion",
    label: "Configuración",
    shortLabel: "Config",
    iconKey: "config" as const,
  },
} satisfies Record<string, AdminCoreNavItem>;

/** Orden único del sidebar: operación diaria → crecimiento → integraciones → ajustes. */
const ADMIN_SIDEBAR_ORDER: Array<
  { kind: "core"; href: keyof typeof CORE_NAV_BY_HREF } | { kind: "module"; moduleId: ModuleId }
> = [
  { kind: "core", href: "/admin" },
  { kind: "core", href: "/admin/pedidos" },
  { kind: "core", href: "/admin/productos" },
  { kind: "core", href: "/admin/modulos/cobros" },
  { kind: "module", moduleId: "shippingCarriers" },
  { kind: "module", moduleId: "crm" },
  { kind: "module", moduleId: "analytics" },
  { kind: "module", moduleId: "coupons" },
  { kind: "module", moduleId: "homeEditor" },
  { kind: "module", moduleId: "marketing" },
  { kind: "module", moduleId: "seo" },
  { kind: "module", moduleId: "wishlist" },
  { kind: "module", moduleId: "multiUser" },
  { kind: "module", moduleId: "api" },
  { kind: "module", moduleId: "premiumThemes" },
  { kind: "core", href: "/admin/configuracion" },
];

export const ADMIN_PLAN_NAV_ITEM: AdminPlanNavItem = {
  kind: "plan",
  href: ADMIN_PLAN_PATH,
  label: "Plan y módulos",
  shortLabel: "Plan",
  iconKey: "plan",
};

/** @deprecated Usar buildAdminNavItems. Mantenido por compatibilidad. */
export const ADMIN_CORE_NAV_ITEMS: AdminCoreNavItem[] = ADMIN_SIDEBAR_ORDER.filter(
  (entry): entry is { kind: "core"; href: keyof typeof CORE_NAV_BY_HREF } =>
    entry.kind === "core",
).map((entry) => CORE_NAV_BY_HREF[entry.href]);

function buildModuleNavItem(moduleId: ModuleId): AdminModuleNavItem {
  const moduleDef = MODULE_CATALOG[moduleId];

  return {
    kind: "module",
    moduleId,
    href: moduleAdminPath(moduleId),
    label: moduleDef.name,
    shortLabel: moduleDef.name.split(" ")[0] ?? moduleDef.name,
    iconKey: moduleId,
  };
}

/** @deprecated Usar buildAdminNavItems. Orden alfabético por MODULE_IDS ya no aplica. */
export const ADMIN_MODULE_NAV_ITEMS: AdminModuleNavItem[] = ADMIN_SIDEBAR_ORDER.filter(
  (entry): entry is { kind: "module"; moduleId: ModuleId } => entry.kind === "module",
).map((entry) => buildModuleNavItem(entry.moduleId));

export function buildAdminNavItems(
  enabledModuleIds: readonly ModuleId[],
): AdminNavItem[] {
  const enabled = new Set(enabledModuleIds);
  const mainItems: AdminNavItem[] = [];

  for (const entry of ADMIN_SIDEBAR_ORDER) {
    if (entry.kind === "core") {
      mainItems.push(CORE_NAV_BY_HREF[entry.href]);
      continue;
    }

    if (enabled.has(entry.moduleId)) {
      mainItems.push(buildModuleNavItem(entry.moduleId));
    }
  }

  return [...mainItems, ADMIN_PLAN_NAV_ITEM];
}

export function splitAdminNavItems(enabledModuleIds: readonly ModuleId[]) {
  const items = buildAdminNavItems(enabledModuleIds);
  const planItem =
    items.find((item) => item.kind === "plan") ?? ADMIN_PLAN_NAV_ITEM;
  const mainItems = items.filter((item) => item.kind !== "plan");

  return {
    mainItems,
    planItem,
    coreItems: mainItems.filter((item) => item.kind === "core"),
    moduleItems: mainItems.filter((item) => item.kind === "module"),
  };
}

export function listModulesInSidebarOrder(): Array<(typeof MODULE_CATALOG)[ModuleId]> {
  return ADMIN_SIDEBAR_ORDER.filter(
    (entry): entry is { kind: "module"; moduleId: ModuleId } => entry.kind === "module",
  ).map((entry) => MODULE_CATALOG[entry.moduleId]);
}

export function isModuleNavItemEnabled(
  item: AdminModuleNavItem,
  enabledModuleIds: readonly ModuleId[],
): boolean {
  return enabledModuleIds.includes(item.moduleId);
}
