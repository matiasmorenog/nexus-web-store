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

function serializeOrder(order: {
  id: string;
  status: string;
  total: unknown;
  promoDiscount: unknown;
  couponCode: string | null;
  couponDiscount: unknown;
  shippingCost: unknown;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPickup: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  meTrackingNumber: string | null;
  meTrackingUrl: string | null;
  meCarrier: string | null;
  meStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: unknown;
    variant: {
      id: string;
      sku: string;
      size: string;
      color: string;
      product: { id: string; slug: string; name: string };
    };
  }>;
}) {
  return {
    id: order.id,
    status: order.status,
    total: Number(order.total),
    promoDiscount: Number(order.promoDiscount),
    couponCode: order.couponCode,
    couponDiscount: Number(order.couponDiscount),
    shippingCost: Number(order.shippingCost),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    isPickup: order.isPickup,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingZip: order.shippingZip,
    trackingNumber: order.meTrackingNumber,
    trackingUrl: order.meTrackingUrl,
    carrier: order.meCarrier,
    carrierStatus: order.meStatus,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        size: item.variant.size,
        color: item.variant.color,
        product: {
          id: item.variant.product.id,
          slug: item.variant.product.slug,
          name: item.variant.product.name,
        },
      },
    })),
  };
}

const orderInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            select: { id: true, slug: true, name: true },
          },
        },
      },
    },
  },
} as const;

export async function GET(request: NextRequest) {
  const auth = await authenticateStoreApiRequest(request);
  if (!auth) return unauthorizedApiResponse();

  const { cursor, limit } = parsePagination(request);

  const orders = await db.order.findMany({
    where: { storeId: auth.storeId },
    orderBy: { id: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: orderInclude,
  });

  const hasMore = orders.length > limit;
  const page = hasMore ? orders.slice(0, limit) : orders;
  const nextCursor = hasMore ? page[page.length - 1]?.id : null;

  return NextResponse.json({
    data: page.map(serializeOrder),
    pagination: {
      nextCursor,
      limit,
    },
  });
}
