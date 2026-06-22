import { cache } from "react";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";

export const resolveAdminStoreId = cache(
  async (
    userId: string,
  ): Promise<{ storeId: string | null; storeSlug: string | null }> => {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        stores: {
          take: 1,
          include: { store: { select: { id: true, slug: true } } },
        },
      },
    });

    const linked = user?.stores[0]?.store;
    if (linked) {
      return { storeId: linked.id, storeSlug: linked.slug };
    }

    try {
      const storeId = await getStoreId();
      const store = await db.store.findUnique({
        where: { id: storeId },
        select: { slug: true },
      });
      return { storeId, storeSlug: store?.slug ?? null };
    } catch {
      return { storeId: null, storeSlug: null };
    }
  },
);
