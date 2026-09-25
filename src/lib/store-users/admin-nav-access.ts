import {
  buildAdminNavItems,
  type AdminNavItem,
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

export function buildFilteredAdminNavItems(
  context: AdminAccessContext,
  enabledModuleIds: readonly ModuleId[],
): AdminNavItem[] {
  return filterAdminNavItems(
    buildAdminNavItems(enabledModuleIds),
    context,
    enabledModuleIds,
  );
}
