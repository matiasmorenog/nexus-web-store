import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  BRAND_SUFFIX,
  formatStoreName,
  getBrandPrefix,
} from "@/lib/brand";
import { db } from "@/lib/db";

export { BRAND_SUFFIX, formatStoreName, getBrandPrefix };

export const STORE_CACHE_TAG = "store";

const STORE_CACHE_REVALIDATE_SECONDS = 300;

const getCachedActiveStore = unstable_cache(
  async () => {
    const stores = await db.store.findMany({
      orderBy: { createdAt: "asc" },
      take: 2,
    });

    if (stores.length === 0) {
      throw new Error(
        "No hay tienda en la base. Ejecutá npm run db:setup (ver prisma/seed-env.ts).",
      );
    }

    if (stores.length > 1) {
      throw new Error(
        "Hay más de una tienda en la base. Este deploy es de una sola tienda; usá una DB por cliente o implementá resolución por dominio.",
      );
    }

    return stores[0];
  },
  ["active-store"],
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
