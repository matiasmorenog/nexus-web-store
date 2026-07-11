import type { StoreStaffRole } from "@prisma/client";
import { db } from "@/lib/db";

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
