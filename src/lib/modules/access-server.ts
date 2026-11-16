import "server-only";

import { redirect } from "next/navigation";
import {
  getModuleDefinition,
  type ModuleId,
} from "@/lib/modules/catalog";
import {
  getEnabledModulesForStore,
  storeHasModule,
} from "@/lib/modules/access";
import { moduleUpgradeHref } from "@/lib/modules/paths";
import type { ModuleAccessResult } from "@/lib/modules/types";
import { MODULE_REQUIRED_ERROR_CODE } from "@/lib/modules/types";
import { getStoreId } from "@/lib/store-context";

export async function getEnabledModuleIds(
  storeId?: string,
): Promise<ModuleId[]> {
  const resolvedStoreId = storeId ?? (await getStoreId());
  const enabled = await getEnabledModulesForStore(resolvedStoreId);
  return Array.from(enabled);
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
    const moduleDef = getModuleDefinition(moduleId);
    const error = new Error(`Module required: ${moduleId}`) as Error & {
      code: typeof MODULE_REQUIRED_ERROR_CODE;
      moduleId: ModuleId;
      moduleName: string;
      upgradeHref: string;
      status: number;
    };
    error.code = MODULE_REQUIRED_ERROR_CODE;
    error.moduleId = moduleId;
    error.moduleName = moduleDef.name;
    error.upgradeHref = access.upgradeHref;
    error.status = 403;
    throw error;
  }
}
