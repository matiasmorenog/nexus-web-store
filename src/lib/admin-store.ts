import { cache } from "react";
import { adminMayAccessCurrentStore } from "@/lib/store-users/membership";
import { db } from "@/lib/db";

/**
 * Resolve store for an admin JWT.
 * Prefer membership on the current deploy store; never fall back to
 * "any linked store" or bare getStoreId without membership.
 */
export const resolveAdminStoreId = cache(
  async (
    userId: string,
  ): Promise<{ storeId: string | null; storeSlug: string | null }> => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { storeId: null, storeSlug: null };
    }

    const access = await adminMayAccessCurrentStore(userId, user.role);
    if (!access.allowed) {
      return { storeId: null, storeSlug: null };
    }

    return { storeId: access.storeId, storeSlug: access.storeSlug };
  },
);
