import { NextRequest, NextResponse } from "next/server";
import {
  authenticateStoreApiRequest,
  unauthorizedApiResponse,
} from "@/lib/store-api/auth";
import { db } from "@/lib/db";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parsePagination(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const limitRaw = Number(request.nextUrl.searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, Math.trunc(limitRaw)), MAX_LIMIT)
    : DEFAULT_LIMIT;

  return { cursor, limit };
}

export async function GET(request: NextRequest) {
  const auth = await authenticateStoreApiRequest(request);
  if (!auth) return unauthorizedApiResponse();

  const { cursor, limit } = parsePagination(request);

  const products = await db.product.findMany({
    where: { storeId: auth.storeId },
    orderBy: { id: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          sku: true,
          stock: true,
          price: true,
          imageUrl: true,
        },
      },
    },
  });

  const hasMore = products.length > limit;
  const page = hasMore ? products.slice(0, limit) : products;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  return NextResponse.json({
    data: page.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      audience: product.audience,
      featured: product.featured,
      promo2x1: product.promo2x1,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        stock: variant.stock,
        price: Number(variant.price),
        imageUrl: variant.imageUrl,
      })),
    })),
    pagination: {
      nextCursor,
      limit,
    },
  });
}
