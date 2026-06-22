import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  BRAND_SUFFIX,
  formatStoreName,
  getBrandPrefix,
} from "@/lib/brand";
import { db } from "@/lib/db";
import { getDefaultStoreSlug } from "@/lib/store-env";

export { BRAND_SUFFIX, formatStoreName, getBrandPrefix };

export const STORE_CACHE_TAG = "store";

const STORE_CACHE_REVALIDATE_SECONDS = 300;

const getStoreBySlug = unstable_cache(
  async (slug: string) =>
    db.store.findUnique({
      where: { slug },
    }),
  ["store-by-slug"],
  {
    revalidate: STORE_CACHE_REVALIDATE_SECONDS,
    tags: [STORE_CACHE_TAG],
  },
);

export const getStore = cache(async () => {
  const slug = getDefaultStoreSlug();

  const store = await getStoreBySlug(slug);

  if (!store) {
    throw new Error(
      `Store "${slug}" not found. Run npm run db:seed after configuring DATABASE_URL.`,
    );
  }

  return store;
});

export const getStoreId = cache(async () => {
  const store = await getStore();
  return store.id;
});

export const getStoreDisplayName = cache(async () => {
  const store = await getStore();
  return formatStoreName(store.name);
});
