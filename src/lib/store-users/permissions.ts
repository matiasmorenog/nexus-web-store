import type { StoreStaffRole } from "@prisma/client";
import type { ModuleId } from "@/lib/modules/catalog";

export type AdminPermission =
  | "dashboard:view"
  | "products:view"
  | "products:manage"
  | "orders:view"
  | "orders:manage"
  | "config:view"
  | "config:manage"
  | "plan:view"
  | "staff:manage"
  | "modules:view"
  | "modules:manage";

export const STORE_STAFF_ROLES = [
  "ADMIN",
  "SELLER",
  "WAREHOUSE",
  "READ_ONLY",
] as const satisfies readonly StoreStaffRole[];

export const STORE_STAFF_ROLE_LABELS: Record<StoreStaffRole, string> = {
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  WAREHOUSE: "Depósito",
  READ_ONLY: "Solo lectura",
};

export const STORE_STAFF_ROLE_DESCRIPTIONS: Record<StoreStaffRole, string> = {
  ADMIN: "Acceso completo al panel, igual que el owner.",
  SELLER: "Pedidos y CRM. Sin acceso a productos ni configuración.",
  WAREHOUSE: "Productos, pedidos y envíos carrier.",
  READ_ONLY: "Solo lectura en todo el panel.",
};

const ALL_PERMISSIONS: AdminPermission[] = [
  "dashboard:view",
  "products:view",
  "products:manage",
  "orders:view",
  "orders:manage",
  "config:view",
  "config:manage",
  "plan:view",
  "staff:manage",
  "modules:view",
  "modules:manage",
];

const STAFF_ROLE_PERMISSIONS: Record<StoreStaffRole, AdminPermission[]> = {
  ADMIN: ALL_PERMISSIONS,
  SELLER: [
    "dashboard:view",
    "orders:view",
    "orders:manage",
    "modules:view",
    "modules:manage",
  ],
  WAREHOUSE: [
    "dashboard:view",
    "products:view",
    "products:manage",
    "orders:view",
    "orders:manage",
    "modules:view",
    "modules:manage",
  ],
  READ_ONLY: [
    "dashboard:view",
    "products:view",
    "orders:view",
    "config:view",
    "plan:view",
    "modules:view",
  ],
};

/** Módulos visibles/gestionables por rol staff (además del gating por ENABLED_MODULES). */
export const STAFF_ROLE_MODULE_ACCESS: Record<
  StoreStaffRole,
  { view: ModuleId[] | "all"; manage: ModuleId[] | "all" }
> = {
  ADMIN: {
    view: "all",
    manage: "all",
  },
  SELLER: {
    view: ["crm"],
    manage: ["crm"],
  },
  WAREHOUSE: {
    view: ["shippingCarriers"],
    manage: ["shippingCarriers"],
  },
  READ_ONLY: {
    view: "all",
    manage: [],
  },
};

export type AdminAccessContext = {
  role: string;
  staffRole: StoreStaffRole | null;
};

export function canManageStoreUsers(context: AdminAccessContext): boolean {
  return hasAdminPermission(context, "staff:manage");
}

export function isStoreStaffRole(value: string): value is StoreStaffRole {
  return STORE_STAFF_ROLES.includes(value as StoreStaffRole);
}

export function resolveAdminPermissions(
  context: AdminAccessContext,
): ReadonlySet<AdminPermission> {
  if (
    context.role === "PLATFORM_ADMIN" ||
    context.role === "STORE_OWNER"
  ) {
    return new Set(ALL_PERMISSIONS);
  }

  if (context.role === "STORE_STAFF" && context.staffRole) {
    return new Set(STAFF_ROLE_PERMISSIONS[context.staffRole]);
  }

  return new Set();
}

export function hasAdminPermission(
  context: AdminAccessContext,
  permission: AdminPermission,
): boolean {
  return resolveAdminPermissions(context).has(permission);
}

export function canViewAdminModule(
  context: AdminAccessContext,
  moduleId: ModuleId,
): boolean {
  if (
    context.role === "PLATFORM_ADMIN" ||
    context.role === "STORE_OWNER"
  ) {
    return true;
  }

  if (context.role !== "STORE_STAFF" || !context.staffRole) {
    return false;
  }

  const access = STAFF_ROLE_MODULE_ACCESS[context.staffRole];
  return access.view === "all" || access.view.includes(moduleId);
}

export function canManageAdminModule(
  context: AdminAccessContext,
  moduleId: ModuleId,
): boolean {
  if (
    context.role === "PLATFORM_ADMIN" ||
    context.role === "STORE_OWNER"
  ) {
    return true;
  }

  if (context.role !== "STORE_STAFF" || !context.staffRole) {
    return false;
  }

  const access = STAFF_ROLE_MODULE_ACCESS[context.staffRole];
  return access.manage === "all" || access.manage.includes(moduleId);
}

export function canAccessAdminPath(
  context: AdminAccessContext,
  pathname: string,
): boolean {
  const permissions = resolveAdminPermissions(context);

  if (pathname === "/admin" || pathname.startsWith("/admin?")) {
    return permissions.has("dashboard:view");
  }

  if (pathname.startsWith("/admin/productos")) {
    return permissions.has("products:view");
  }

  if (pathname.startsWith("/admin/pedidos")) {
    return permissions.has("orders:view");
  }

  if (pathname.startsWith("/admin/configuracion")) {
    return permissions.has("config:view");
  }

  if (pathname.startsWith("/admin/modulos/cobros")) {
    return permissions.has("config:view");
  }

  if (pathname.startsWith("/admin/plan")) {
    return permissions.has("plan:view");
  }

  if (pathname.startsWith("/admin/modulos/multiUser")) {
    return permissions.has("staff:manage");
  }

  const moduleMatch = pathname.match(/^\/admin\/modulos\/([^/?]+)/);
  if (moduleMatch?.[1]) {
    const moduleId = moduleMatch[1] as ModuleId;
    return canViewAdminModule(context, moduleId);
  }

  return permissions.has("dashboard:view");
}

export function getDefaultAdminLandingPath(
  context: AdminAccessContext,
): string {
  const permissions = resolveAdminPermissions(context);

  if (permissions.has("dashboard:view")) {
    return "/admin";
  }

  if (permissions.has("orders:view")) {
    return "/admin/pedidos";
  }

  if (permissions.has("products:view")) {
    return "/admin/productos";
  }

  return "/admin/logout";
}
