import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  formatStoreName,
  getBrandPrefix,
} from "@/lib/brand";
import { STORE_CACHE_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { DEFAULT_STORE_SLUG } from "@/lib/store-env";

export { formatStoreName, getBrandPrefix };

export const STORE_CACHE_TAG = "store";

const getCachedActiveStore = unstable_cache(
  async () => {
    const store = await db.store.findUnique({
      where: { slug: DEFAULT_STORE_SLUG },
    });

    if (!store) {
      throw new Error(
        `No hay tienda con slug "${DEFAULT_STORE_SLUG}". Ejecutá npm run db:setup (ver prisma/seed-env.ts).`,
      );
    }

    return store;
  },
  ["active-store", DEFAULT_STORE_SLUG],
  {
    revalidate: STORE_CACHE_REVALIDATE_SECONDS,
    tags: [STORE_CACHE_TAG],
  },
);

export const getStore = cache(async () => getCachedActiveStore());

export const getStoreId = cache(async () => {
  const store = await getStore();
  return store.id;
});

export const getStoreDisplayName = cache(async () => {
  const store = await getStore();
  return formatStoreName(store.name);
});
