import type { ModuleId } from "@/lib/modules/catalog";

export const ADMIN_PLAN_PATH = "/admin/plan";

export function moduleAdminPath(moduleId: ModuleId): string {
  if (moduleId === "analytics") return "/admin/modulos/trafico";
  if (moduleId === "shippingCarriers") return "/admin/configuracion/envios";
  return `/admin/modulos/${moduleId}`;
}

export function moduleUpgradeHref(moduleId: ModuleId): string {
  return `${ADMIN_PLAN_PATH}?module=${moduleId}`;
}
