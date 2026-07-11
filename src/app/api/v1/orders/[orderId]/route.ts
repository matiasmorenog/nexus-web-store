import { NextRequest, NextResponse } from "next/server";
import {
  authenticateStoreApiRequest,
  unauthorizedApiResponse,
} from "@/lib/store-api/auth";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authenticateStoreApiRequest(request);
  if (!auth) return unauthorizedApiResponse();

  const { orderId } = await context.params;

  const order = await db.order.findFirst({
    where: { id: orderId, storeId: auth.storeId },
    include: {
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
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
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
      customerTaxId: order.customerTaxId,
      invoiceStatus: order.invoiceStatus,
      invoiceNumber: order.invoiceNumber,
      invoiceCae: order.invoiceCae,
      invoicedAt: order.invoicedAt?.toISOString() ?? null,
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
    },
  });
}
