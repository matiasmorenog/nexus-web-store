import { cache } from "react";
import { redirect } from "next/navigation";
import type { StoreStaffRole } from "@prisma/client";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import type { ModuleId } from "@/lib/modules/catalog";
import { DEFAULT_STORE_SLUG } from "@/lib/store-env";
import { storefrontPath } from "@/lib/storefront-paths";
import {
  adminMayAccessCurrentStore,
  getStoreStaffRoleForUser,
} from "@/lib/store-users/membership";
import {
  canAccessAdminPath,
  canManageAdminModule,
  canViewAdminModule,
  getDefaultAdminLandingPath,
  hasAdminPermission,
  type AdminAccessContext,
  type AdminPermission,
} from "@/lib/store-users/permissions";

type AuthenticatedAdminUser = Session["user"] & {
  id: string;
  storeId: string;
  staffRole: StoreStaffRole | null;
};

export type AdminSession = Omit<Session, "user"> & {
  user: AuthenticatedAdminUser;
};

export function getAdminAccessContext(session: AdminSession): AdminAccessContext {
  return {
    role: session.user.role,
    staffRole: session.user.staffRole,
  };
}

export function adminCanManage(
  session: AdminSession,
  permission: AdminPermission,
): boolean {
  return hasAdminPermission(getAdminAccessContext(session), permission);
}

export function adminCanManageModule(
  session: AdminSession,
  moduleId: ModuleId,
): boolean {
  return canManageAdminModule(getAdminAccessContext(session), moduleId);
}

export async function requireAdminModuleView(
  moduleId: ModuleId,
): Promise<AdminSession> {
  const session = await requireAdminSession();
  const context = getAdminAccessContext(session);

  if (!canViewAdminModule(context, moduleId)) {
    redirect(getDefaultAdminLandingPath(context));
  }

  return session;
}

/** Gate único para `/admin/(protected)/*`: sesión + membership en la tienda del deploy. */
export const requireAdminSession = cache(async (): Promise<AdminSession> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/logout");
  }

  if (session.user.role === "CUSTOMER") {
    redirect(storefrontPath("accountOrders"));
  }

  if (
    session.user.role !== "STORE_OWNER" &&
    session.user.role !== "STORE_STAFF" &&
    session.user.role !== "PLATFORM_ADMIN"
  ) {
    redirect("/admin/logout");
  }

  // Fast path: JWT already scoped to this deploy — skip membership re-check.
  // Revocation takes effect on next login / JWT expiry (same as typical JWT apps).
  if (
    typeof session.user.storeId === "string" &&
    session.user.storeSlug === DEFAULT_STORE_SLUG
  ) {
    const storeId = session.user.storeId;
    let staffRole: StoreStaffRole | null = null;

    if (session.user.role === "STORE_STAFF") {
      staffRole = await getStoreStaffRoleForUser(storeId, session.user.id);
      if (!staffRole) {
        redirect("/admin/logout");
      }
    }

    return {
      ...session,
      user: {
        ...session.user,
        id: session.user.id,
        storeId,
        staffRole,
      },
    };
  }

  const access = await adminMayAccessCurrentStore(
    session.user.id,
    session.user.role,
  );

  if (!access.allowed || !access.storeId) {
    redirect("/admin/logout");
  }

  if (session.user.role === "STORE_STAFF" && !access.staffRole) {
    redirect("/admin/logout");
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: session.user.id,
      storeId: access.storeId,
      staffRole: access.staffRole,
    },
  };
});

export async function requireAdminPermission(
  permission: AdminPermission,
): Promise<AdminSession> {
  const session = await requireAdminSession();
  const context = getAdminAccessContext(session);

  if (!hasAdminPermission(context, permission)) {
    redirect(getDefaultAdminLandingPath(context));
  }

  return session;
}

export async function requireAdminPathAccess(
  pathname: string,
): Promise<AdminSession> {
  const session = await requireAdminSession();
  const context = getAdminAccessContext(session);

  if (!canAccessAdminPath(context, pathname)) {
    redirect(getDefaultAdminLandingPath(context));
  }

  return session;
}

export async function assertAdminPermission(
  permission: AdminPermission,
): Promise<AdminSession> {
  const session = await requireAdminSession();
  const context = getAdminAccessContext(session);

  if (!hasAdminPermission(context, permission)) {
    throw new Error("No tenés permiso para esta acción.");
  }

  return session;
}
