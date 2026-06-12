import { cache } from "react";
import {
  BRAND_SUFFIX,
  formatStoreName,
  getBrandPrefix,
} from "@/lib/brand";
import { db } from "@/lib/db";

export { BRAND_SUFFIX, formatStoreName, getBrandPrefix };

export const getStore = cache(async () => {
  const slug = process.env.DEFAULT_STORE_SLUG ?? "alaska-indumentaria";

  const store = await db.store.findUnique({
    where: { slug },
  });

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
