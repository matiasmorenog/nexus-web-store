import { cache } from "react";
import { db } from "@/lib/db";

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
