export {
  ADMIN_PLAN_PATH,
  assertModule,
  checkModuleAccess,
  getEnabledModuleIds,
  getEnabledModulesForStore,
  isModuleRequiredError,
  moduleAdminPath,
  moduleUpgradeHref,
  requireModule,
  storeHasModule,
} from "@/lib/modules/access";
export { moduleErrorResponse } from "@/lib/modules/api-error";
export {
  ADMIN_CORE_NAV_ITEMS,
  ADMIN_MODULE_NAV_ITEMS,
  ADMIN_PLAN_NAV_ITEM,
  buildAdminNavItems,
  isModuleNavItemEnabled,
  splitAdminNavItems,
  type AdminCoreNavItem,
  type AdminModuleNavItem,
  type AdminNavIconKey,
  type AdminNavItem,
  type AdminPlanNavItem,
} from "@/lib/modules/admin-nav";
export {
  BASE_PLAN,
  estimateMonthlyTotal,
  getModuleDefinition,
  isModuleId,
  listModulesByCategory,
  MODULE_CATALOG,
  MODULE_CATEGORY_LABELS,
  MODULE_IDS,
  type ModuleId,
} from "@/lib/modules/catalog";
export {
  MODULE_REQUIRED_ERROR_CODE,
  type ModuleAccessResult,
  type ModuleCategory,
  type ModuleDefinition,
} from "@/lib/modules/types";
