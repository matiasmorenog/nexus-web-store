import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Gift,
  Heart,
  Home,
  LayoutTemplate,
  Megaphone,
  Package,
  Palette,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  Webhook,
} from "lucide-react";
import { ADMIN_PLAN_PATH, moduleAdminPath } from "@/lib/modules/access";
import { MODULE_CATALOG, MODULE_IDS, type ModuleId } from "@/lib/modules/catalog";

export type AdminCoreNavItem = {
  kind: "core";
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminModuleNavItem = {
  kind: "module";
  moduleId: ModuleId;
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminPlanNavItem = {
  kind: "plan";
  href: typeof ADMIN_PLAN_PATH;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type AdminNavItem =
  | AdminCoreNavItem
  | AdminModuleNavItem
  | AdminPlanNavItem;

const MODULE_NAV_ICONS: Record<ModuleId, LucideIcon> = {
  coupons: Gift,
  homeEditor: Home,
  analytics: BarChart3,
  crm: Users,
  shippingCarriers: Truck,
  marketing: Megaphone,
  multiUser: Users,
  api: Webhook,
  premiumThemes: Palette,
  seo: Search,
  wishlist: Heart,
};

export const ADMIN_CORE_NAV_ITEMS: AdminCoreNavItem[] = [
  {
    kind: "core",
    href: "/admin",
    label: "Dashboard",
    shortLabel: "Inicio",
    icon: LayoutTemplate,
    exact: true,
  },
  {
    kind: "core",
    href: "/admin/productos",
    label: "Productos",
    shortLabel: "Productos",
    icon: Package,
  },
  {
    kind: "core",
    href: "/admin/pedidos",
    label: "Pedidos",
    shortLabel: "Pedidos",
    icon: ShoppingCart,
  },
  {
    kind: "core",
    href: "/admin/configuracion",
    label: "Configuración",
    shortLabel: "Config",
    icon: Settings,
  },
];

export const ADMIN_PLAN_NAV_ITEM: AdminPlanNavItem = {
  kind: "plan",
  href: ADMIN_PLAN_PATH,
  label: "Plan y módulos",
  shortLabel: "Plan",
  icon: Sparkles,
};

/** Ítems de nav para módulos que declaran al menos una ruta admin. */
export const ADMIN_MODULE_NAV_ITEMS: AdminModuleNavItem[] = MODULE_IDS.flatMap(
  (moduleId) => {
    const moduleDef = MODULE_CATALOG[moduleId];
    const href = moduleAdminPath(moduleId);

    return [
      {
        kind: "module" as const,
        moduleId,
        href,
        label: moduleDef.name,
        shortLabel: moduleDef.name.split(" ")[0] ?? moduleDef.name,
        icon: MODULE_NAV_ICONS[moduleId],
      },
    ];
  },
);

export function buildAdminNavItems(
  enabledModuleIds: readonly ModuleId[],
): AdminNavItem[] {
  const enabled = new Set(enabledModuleIds);
  const moduleItems = ADMIN_MODULE_NAV_ITEMS.filter((item) =>
    enabled.has(item.moduleId),
  );

  return [...ADMIN_CORE_NAV_ITEMS, ...moduleItems, ADMIN_PLAN_NAV_ITEM];
}

export function splitAdminNavItems(enabledModuleIds: readonly ModuleId[]) {
  const items = buildAdminNavItems(enabledModuleIds);
  return {
    coreItems: items.filter((item) => item.kind === "core"),
    moduleItems: items.filter((item) => item.kind === "module"),
    planItem:
      items.find((item) => item.kind === "plan") ?? ADMIN_PLAN_NAV_ITEM,
  };
}

export function isModuleNavItemEnabled(
  item: AdminModuleNavItem,
  enabledModuleIds: readonly ModuleId[],
): boolean {
  return enabledModuleIds.includes(item.moduleId);
}
