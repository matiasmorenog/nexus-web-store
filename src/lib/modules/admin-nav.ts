import { ADMIN_PLAN_PATH, moduleAdminPath } from "@/lib/modules/access";
import { MODULE_CATALOG, type ModuleId } from "@/lib/modules/catalog";

export type AdminNavIconKey =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "cobros"
  | "config"
  | "language"
  | "security"
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

export type AdminNavModel = {
  /** Day-to-day sidebar items (excludes Config hub + set-and-forget children). */
  mainItems: AdminNavItem[];
  /** Config group toggle only (not a page). Path prefix for open state. */
  configHub: AdminCoreNavItem;
  /** Children under Config (idioma, seguridad, modules, plan). */
  configChildren: AdminNavItem[];
};

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
  "/admin/categorias": {
    kind: "core" as const,
    href: "/admin/categorias",
    label: "Categorías",
    shortLabel: "Categorías",
    iconKey: "categories" as const,
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
  "/admin/configuracion/idioma": {
    kind: "core" as const,
    href: "/admin/configuracion/idioma",
    label: "Idioma",
    shortLabel: "Idioma",
    iconKey: "language" as const,
    exact: true,
  },
  "/admin/configuracion/seguridad": {
    kind: "core" as const,
    href: "/admin/configuracion/seguridad",
    label: "Seguridad",
    shortLabel: "Seguridad",
    iconKey: "security" as const,
    exact: true,
  },
} satisfies Record<string, AdminCoreNavItem>;

/**
 * Set-and-forget modules live under Configuración accordion (not top-level).
 * Wishlist stays in the main sidebar (E1 without wishlist).
 */
export const ADMIN_CONFIG_SUBMENU_MODULE_IDS = [
  "multiUser",
  "marketing",
  "seo",
  "api",
] as const satisfies readonly ModuleId[];

export type AdminConfigSubmenuModuleId =
  (typeof ADMIN_CONFIG_SUBMENU_MODULE_IDS)[number];

export function isConfigSubmenuModuleId(
  moduleId: ModuleId,
): moduleId is AdminConfigSubmenuModuleId {
  return (ADMIN_CONFIG_SUBMENU_MODULE_IDS as readonly ModuleId[]).includes(
    moduleId,
  );
}

/** Orden único del sidebar principal: operación diaria → crecimiento → config hub. */
const ADMIN_MAIN_SIDEBAR_ORDER: Array<
  | { kind: "core"; href: keyof typeof CORE_NAV_BY_HREF }
  | { kind: "module"; moduleId: ModuleId }
> = [
  { kind: "core", href: "/admin" },
  { kind: "core", href: "/admin/pedidos" },
  { kind: "core", href: "/admin/productos" },
  { kind: "core", href: "/admin/categorias" },
  { kind: "core", href: "/admin/modulos/cobros" },
  { kind: "module", moduleId: "shippingCarriers" },
  { kind: "module", moduleId: "crm" },
  { kind: "module", moduleId: "analytics" },
  { kind: "module", moduleId: "coupons" },
  { kind: "module", moduleId: "homeEditor" },
  { kind: "module", moduleId: "wishlist" },
  { kind: "core", href: "/admin/configuracion" },
];

/**
 * Orden bajo Configuración (toggle only):
 * idioma → seguridad → gente → canales → SEO → técnico → plan.
 */
const ADMIN_CONFIG_CHILDREN_ORDER: Array<
  | { kind: "plan" }
  | { kind: "core"; href: "/admin/configuracion/idioma" | "/admin/configuracion/seguridad" }
  | { kind: "module"; moduleId: AdminConfigSubmenuModuleId }
> = [
  { kind: "core", href: "/admin/configuracion/idioma" },
  { kind: "core", href: "/admin/configuracion/seguridad" },
  { kind: "module", moduleId: "multiUser" },
  { kind: "module", moduleId: "marketing" },
  { kind: "module", moduleId: "seo" },
  { kind: "module", moduleId: "api" },
  { kind: "plan" },
];

/** Orden completo (plan page / docs): main modules + config submenu modules. */
const ADMIN_SIDEBAR_ORDER: Array<
  | { kind: "core"; href: keyof typeof CORE_NAV_BY_HREF }
  | { kind: "module"; moduleId: ModuleId }
> = [
  ...ADMIN_MAIN_SIDEBAR_ORDER.filter(
    (entry) =>
      !(entry.kind === "core" && entry.href === "/admin/configuracion"),
  ),
  { kind: "core", href: "/admin/configuracion/idioma" },
  { kind: "core", href: "/admin/configuracion/seguridad" },
  ...ADMIN_CONFIG_SUBMENU_MODULE_IDS.map((moduleId) => ({
    kind: "module" as const,
    moduleId,
  })),
];

export const ADMIN_PLAN_NAV_ITEM: AdminPlanNavItem = {
  kind: "plan",
  href: ADMIN_PLAN_PATH,
  label: "Plan y módulos",
  shortLabel: "Plan",
  iconKey: "plan",
};

/** @deprecated Usar buildAdminNavModel. Mantenido por compatibilidad. */
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

/** @deprecated Usar buildAdminNavModel. */
export const ADMIN_MODULE_NAV_ITEMS: AdminModuleNavItem[] = ADMIN_SIDEBAR_ORDER.filter(
  (entry): entry is { kind: "module"; moduleId: ModuleId } =>
    entry.kind === "module",
).map((entry) => buildModuleNavItem(entry.moduleId));

export function buildAdminNavModel(
  enabledModuleIds: readonly ModuleId[],
): AdminNavModel {
  const enabled = new Set(enabledModuleIds);
  const mainItems: AdminNavItem[] = [];

  for (const entry of ADMIN_MAIN_SIDEBAR_ORDER) {
    if (entry.kind === "core") {
      if (entry.href === "/admin/configuracion") continue;
      mainItems.push(CORE_NAV_BY_HREF[entry.href]);
      continue;
    }

    if (enabled.has(entry.moduleId)) {
      mainItems.push(buildModuleNavItem(entry.moduleId));
    }
  }

  const configChildren: AdminNavItem[] = [];
  for (const entry of ADMIN_CONFIG_CHILDREN_ORDER) {
    if (entry.kind === "plan") {
      configChildren.push(ADMIN_PLAN_NAV_ITEM);
      continue;
    }
    if (entry.kind === "core") {
      configChildren.push(CORE_NAV_BY_HREF[entry.href]);
      continue;
    }
    if (enabled.has(entry.moduleId)) {
      configChildren.push(buildModuleNavItem(entry.moduleId));
    }
  }

  return {
    mainItems,
    configHub: CORE_NAV_BY_HREF["/admin/configuracion"],
    configChildren,
  };
}

/** Flat list for legacy callers (main + config hub + children). */
export function buildAdminNavItems(
  enabledModuleIds: readonly ModuleId[],
): AdminNavItem[] {
  const model = buildAdminNavModel(enabledModuleIds);
  return [
    ...model.mainItems,
    model.configHub,
    ...model.configChildren,
  ];
}

export function splitAdminNavItems(enabledModuleIds: readonly ModuleId[]) {
  const model = buildAdminNavModel(enabledModuleIds);
  const items = buildAdminNavItems(enabledModuleIds);
  const planItem =
    model.configChildren.find((item) => item.kind === "plan") ??
    ADMIN_PLAN_NAV_ITEM;
  const mainItems = items.filter((item) => item.kind !== "plan");

  return {
    mainItems,
    planItem,
    coreItems: mainItems.filter((item) => item.kind === "core"),
    moduleItems: mainItems.filter((item) => item.kind === "module"),
    configHub: model.configHub,
    configChildren: model.configChildren,
  };
}

export function listModulesInSidebarOrder(): Array<
  (typeof MODULE_CATALOG)[ModuleId]
> {
  return ADMIN_SIDEBAR_ORDER.filter(
    (entry): entry is { kind: "module"; moduleId: ModuleId } =>
      entry.kind === "module",
  ).map((entry) => MODULE_CATALOG[entry.moduleId]);
}

export function isModuleNavItemEnabled(
  item: AdminModuleNavItem,
  enabledModuleIds: readonly ModuleId[],
): boolean {
  return enabledModuleIds.includes(item.moduleId);
}

export function isAdminNavItemActive(
  pathname: string,
  item: Pick<AdminNavItem, "href" | "exact">,
): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isConfigSubmenuPathActive(
  pathname: string,
  model: Pick<AdminNavModel, "configHub" | "configChildren">,
): boolean {
  if (pathname === model.configHub.href) return true;
  if (pathname.startsWith(`${model.configHub.href}/`)) return true;
  return model.configChildren.some((item) =>
    isAdminNavItemActive(pathname, item),
  );
}
