import type { StoreStaffRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";
import { isAdminRole } from "@/lib/auth-session";

export async function getStoreStaffRoleForUser(
  storeId: string,
  userId: string,
): Promise<StoreStaffRole | null> {
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
}

export async function userBelongsToStore(
  userId: string,
  storeId: string,
): Promise<boolean> {
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
}

/**
 * Admin access is scoped to the deploy's store (`DEFAULT_STORE_SLUG`).
 * PLATFORM_ADMIN may enter any store; owners/staff need a UserStore row.
 */
export async function adminMayAccessCurrentStore(
  userId: string,
  role: string,
): Promise<{
  allowed: boolean;
  storeId: string | null;
  storeSlug: string | null;
}> {
  if (!isAdminRole(role)) {
    return { allowed: false, storeId: null, storeSlug: null };
  }

  let storeId: string;
  try {
    storeId = await getStoreId();
  } catch {
    return { allowed: false, storeId: null, storeSlug: null };
  }

  const store = await db.store.findUnique({
    where: { id: storeId },
    select: { slug: true },
  });

  if (!store) {
    return { allowed: false, storeId: null, storeSlug: null };
  }

  if (role === "PLATFORM_ADMIN") {
    return { allowed: true, storeId, storeSlug: store.slug };
  }

  const belongs = await userBelongsToStore(userId, storeId);
  if (!belongs) {
    return { allowed: false, storeId: null, storeSlug: null };
  }

  return { allowed: true, storeId, storeSlug: store.slug };
}
