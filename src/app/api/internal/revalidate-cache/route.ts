import { NextResponse } from "next/server";
import { revalidateAllStoreCache } from "@/lib/revalidate-all-cache";
import { db } from "@/lib/db";
import { DEFAULT_STORE_SLUG } from "@/lib/store-env";

function isAuthorized(request: Request) {
  const secret =
    process.env.CACHE_REVALIDATE_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await db.store.findUnique({
    where: { slug: DEFAULT_STORE_SLUG },
    select: { id: true, slug: true },
  });

  if (!store) {
    return NextResponse.json({ error: "No store in database" }, { status: 404 });
  }

  const products = await db.product.findMany({
    where: { storeId: store.id },
    select: { slug: true },
  });

  revalidateAllStoreCache(
    store.id,
    products.map((product) => product.slug),
  );

  return NextResponse.json({
    ok: true,
    storeId: store.id,
    storeSlug: store.slug,
    productPaths: products.length,
  });
}
