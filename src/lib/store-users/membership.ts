import { cache } from "react";
import type { StoreStaffRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getStore } from "@/lib/store-context";
import { isAdminRole } from "@/lib/auth-session";

export type AdminStoreAccess = {
  allowed: boolean;
  storeId: string | null;
  storeSlug: string | null;
  staffRole: StoreStaffRole | null;
};

export const getStoreStaffRoleForUser = cache(
  async (
    storeId: string,
    userId: string,
  ): Promise<StoreStaffRole | null> => {
    const membership = await db.userStore.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      select: { staffRole: true },
    });

    return membership?.staffRole ?? null;
  },
);

export const userBelongsToStore = cache(
  async (userId: string, storeId: string): Promise<boolean> => {
    const membership = await db.userStore.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      select: { id: true },
    });

    return Boolean(membership);
  },
);

/**
 * Admin access is scoped to the deploy's store (`DEFAULT_STORE_SLUG`).
 * PLATFORM_ADMIN may enter any store; owners/staff need a UserStore row.
 * Deduped per request via React `cache`.
 */
export const adminMayAccessCurrentStore = cache(
  async (userId: string, role: string): Promise<AdminStoreAccess> => {
    if (!isAdminRole(role)) {
      return {
        allowed: false,
        storeId: null,
        storeSlug: null,
        staffRole: null,
      };
    }

    let store: Awaited<ReturnType<typeof getStore>>;
    try {
      store = await getStore();
    } catch {
      return {
        allowed: false,
        storeId: null,
        storeSlug: null,
        staffRole: null,
      };
    }

    if (role === "PLATFORM_ADMIN") {
      return {
        allowed: true,
        storeId: store.id,
        storeSlug: store.slug,
        staffRole: null,
      };
    }

    const membership = await db.userStore.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: store.id,
        },
      },
      select: { staffRole: true },
    });

    if (!membership) {
      return {
        allowed: false,
        storeId: null,
        storeSlug: null,
        staffRole: null,
      };
    }

    return {
      allowed: true,
      storeId: store.id,
      storeSlug: store.slug,
      staffRole: role === "STORE_STAFF" ? membership.staffRole : null,
    };
  },
);
