import type { StoreStaffMember } from "@/lib/store-users/types";
import { db } from "@/lib/db";

export async function listStoreStaffMembers(
  storeId: string,
): Promise<StoreStaffMember[]> {
  const rows = await db.userStore.findMany({
    where: {
      storeId,
      user: { role: "STORE_STAFF" },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { user: { createdAt: "asc" } },
  });

  return rows.map((row) => ({
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    role: "STORE_STAFF",
    joinedAt: row.user.createdAt.toISOString(),
  }));
}

export async function countStoreStaffMembers(storeId: string): Promise<number> {
  return db.userStore.count({
    where: {
      storeId,
      user: { role: "STORE_STAFF" },
    },
  });
}
