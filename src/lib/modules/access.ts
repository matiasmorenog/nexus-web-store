import { redirect } from "next/navigation";
import {
  getModuleDefinition,
  isModuleId,
  MODULE_IDS,
  type ModuleId,
} from "@/lib/modules/catalog";
import type { ModuleAccessResult } from "@/lib/modules/types";
import { MODULE_REQUIRED_ERROR_CODE } from "@/lib/modules/types";
import { getStoreId } from "@/lib/store-context";

export const ADMIN_PLAN_PATH = "/admin/plan";

/** Override por env. Vacío = todos activos (demo). `none` = solo plan base. */
function parseEnabledModulesFromEnv(): Set<ModuleId> {
  const raw = process.env.ENABLED_MODULES?.trim();

  if (!raw) {
    return new Set(MODULE_IDS);
  }

  if (raw === "none" || raw === "-") {
    return new Set();
  }

  const ids = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const enabled = new Set<ModuleId>();
  for (const id of ids) {
    if (isModuleId(id)) {
      enabled.add(id);
    }
  }
  return enabled;
}

/**
 * Módulos activos para la tienda actual.
 * Fase C: leer `StoreModule` en DB; env queda como override.
 */
export async function getEnabledModulesForStore(
  _storeId?: string,
): Promise<Set<ModuleId>> {
  void _storeId;
  return parseEnabledModulesFromEnv();
}

export async function storeHasModule(
  storeId: string,
  moduleId: ModuleId,
): Promise<boolean> {
  const enabled = await getEnabledModulesForStore(storeId);
  return enabled.has(moduleId);
}

export async function getEnabledModuleIds(
  storeId?: string,
): Promise<ModuleId[]> {
  const resolvedStoreId = storeId ?? (await getStoreId());
  const enabled = await getEnabledModulesForStore(resolvedStoreId);
  return Array.from(enabled);
}

export function moduleAdminPath(moduleId: ModuleId): string {
  return `/admin/modulos/${moduleId}`;
}

export function moduleUpgradeHref(moduleId: ModuleId): string {
  return `${ADMIN_PLAN_PATH}?module=${moduleId}`;
}

export async function checkModuleAccess(
  moduleId: ModuleId,
  storeId?: string,
): Promise<ModuleAccessResult> {
  const resolvedStoreId = storeId ?? (await getStoreId());
  const allowed = await storeHasModule(resolvedStoreId, moduleId);

  if (allowed) {
    return { allowed: true };
  }

  return {
    allowed: false,
    moduleId,
    upgradeHref: moduleUpgradeHref(moduleId),
  };
}

/** Redirige a Plan si el módulo no está activo. Usar en layouts de rutas plus. */
export async function requireModule(moduleId: ModuleId): Promise<void> {
  const access = await checkModuleAccess(moduleId);
  if (!access.allowed) {
    redirect(access.upgradeHref);
  }
}

/** Para API routes: lanza error serializable si el módulo no está activo. */
export async function assertModule(moduleId: ModuleId): Promise<void> {
  const access = await checkModuleAccess(moduleId);
  if (!access.allowed) {
    const module = getModuleDefinition(moduleId);
    const error = new Error(`Module required: ${moduleId}`) as Error & {
      code: typeof MODULE_REQUIRED_ERROR_CODE;
      moduleId: ModuleId;
      moduleName: string;
      upgradeHref: string;
      status: number;
    };
    error.code = MODULE_REQUIRED_ERROR_CODE;
    error.moduleId = moduleId;
    error.moduleName = module.name;
    error.upgradeHref = access.upgradeHref;
    error.status = 403;
    throw error;
  }
}

export function isModuleRequiredError(
  error: unknown,
): error is Error & {
  code: typeof MODULE_REQUIRED_ERROR_CODE;
  moduleId: ModuleId;
  moduleName: string;
  upgradeHref: string;
  status: number;
} {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === MODULE_REQUIRED_ERROR_CODE
  );
}
