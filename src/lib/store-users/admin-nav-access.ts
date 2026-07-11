import {
  buildAdminNavItems,
  type AdminNavItem,
} from "@/lib/modules/admin-nav";
import type { ModuleId } from "@/lib/modules/catalog";
import {
  canAccessAdminPath,
  canViewAdminModule,
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
      return canAccessAdminPath(context, item.href);
    }

    if (item.kind === "module") {
      if (!enabled.has(item.moduleId)) {
        return canAccessAdminPath(context, item.href);
      }

      if (item.moduleId === "multiUser") {
        return (
          context.role === "STORE_OWNER" || context.role === "PLATFORM_ADMIN"
        );
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
