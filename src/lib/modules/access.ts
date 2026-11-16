import { getActiveStoreSlug } from "@/lib/store-env";
import { APP3_STORE_SLUG } from "@/lib/store-slugs";
import {
  isModuleId,
  MODULE_IDS,
  PLAN_TIERS,
  type ModuleId,
} from "@/lib/modules/catalog";
import {
  ADMIN_PLAN_PATH,
  moduleAdminPath,
  moduleUpgradeHref,
} from "@/lib/modules/paths";
import { MODULE_REQUIRED_ERROR_CODE } from "@/lib/modules/types";

export { ADMIN_PLAN_PATH, moduleAdminPath, moduleUpgradeHref };

/** Manoviva no muestra el catálogo de planes. Queda fija en Start. */
export function storeHidesPlanCatalog(
  slug: string = getActiveStoreSlug(),
): boolean {
  return slug === APP3_STORE_SLUG;
}

/** Manoviva: sin Mercado Pago (efectivo + bonifico). */
export function storeHidesMercadoPago(
  slug: string = getActiveStoreSlug(),
): boolean {
  return slug === APP3_STORE_SLUG;
}

function startPlanModuleIds(): Set<ModuleId> {
  return new Set(PLAN_TIERS.start.moduleIds);
}

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
  if (storeHidesPlanCatalog()) {
    return startPlanModuleIds();
  }
  return parseEnabledModulesFromEnv();
}

export async function storeHasModule(
  storeId: string,
  moduleId: ModuleId,
): Promise<boolean> {
  const enabled = await getEnabledModulesForStore(storeId);
  return enabled.has(moduleId);
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
