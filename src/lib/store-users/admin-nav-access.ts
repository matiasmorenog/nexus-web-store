import {
  buildAdminNavModel,
  type AdminNavItem,
  type AdminNavModel,
} from "@/lib/modules/admin-nav";
import { storeHidesPlanCatalog } from "@/lib/modules/access";
import type { ModuleId } from "@/lib/modules/catalog";
import {
  canAccessAdminPath,
  canViewAdminModule,
  hasAdminPermission,
  type AdminAccessContext,
} from "@/lib/store-users/permissions";

export function filterAdminNavItems(
  items: AdminNavItem[],
  context: AdminAccessContext,
  enabledModuleIds: readonly ModuleId[],
): AdminNavItem[] {
  const enabled = new Set(enabledModuleIds);

  return items.filter((item) => {
    if (item.kind === "core") {
      return canAccessAdminPath(context, item.href);
    }

    if (item.kind === "plan") {
      if (storeHidesPlanCatalog()) return false;
      return canAccessAdminPath(context, item.href);
    }

    if (item.kind === "module") {
      if (!enabled.has(item.moduleId)) {
        return canAccessAdminPath(context, item.href);
      }

      if (item.moduleId === "multiUser") {
        return hasAdminPermission(context, "staff:manage");
      }

      return canViewAdminModule(context, item.moduleId);
    }

    return true;
  });
}

export function filterAdminNavModel(
  model: AdminNavModel,
  context: AdminAccessContext,
  enabledModuleIds: readonly ModuleId[],
): AdminNavModel {
  const mainItems = filterAdminNavItems(
    model.mainItems,
    context,
    enabledModuleIds,
  );
  const configChildren = filterAdminNavItems(
    model.configChildren,
    context,
    enabledModuleIds,
  );
  const hubAllowed = canAccessAdminPath(context, model.configHub.href);

  return {
    mainItems,
    configHub: model.configHub,
    configChildren: hubAllowed ? configChildren : [],
  };
}

export function buildFilteredAdminNavModel(
  context: AdminAccessContext,
  enabledModuleIds: readonly ModuleId[],
): AdminNavModel {
  return filterAdminNavModel(
    buildAdminNavModel(enabledModuleIds),
    context,
    enabledModuleIds,
  );
}

/** @deprecated Prefer buildFilteredAdminNavModel. */
export function buildFilteredAdminNavItems(
  context: AdminAccessContext,
  enabledModuleIds: readonly ModuleId[],
): AdminNavItem[] {
  const model = buildFilteredAdminNavModel(context, enabledModuleIds);
  return [...model.mainItems, model.configHub, ...model.configChildren];
}
