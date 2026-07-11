import type { Prisma } from "@prisma/client";
import type { OrderPaidWebhookData } from "@/lib/afip/types";

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
} satisfies Prisma.OrderInclude;

type OrderForWebhook = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

export function buildOrderPaidWebhookData(
  order: OrderForWebhook,
): OrderPaidWebhookData {
  const promoDiscount = Number(order.promoDiscount);
  const couponDiscount = Number(order.couponDiscount);
  const shippingCost = Number(order.shippingCost);
  const total = Number(order.total);
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  const subtotal = Math.max(
    0,
    itemsSubtotal - promoDiscount - couponDiscount,
  );

  return {
    orderId: order.id,
    status: "PAID",
    total,
    subtotal,
    shippingCost,
    promoDiscount,
    couponCode: order.couponCode,
    couponDiscount,
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      taxId: order.customerTaxId,
    },
    shipping: {
      isPickup: order.isPickup,
      address: order.shippingAddress,
      city: order.shippingCity,
      zip: order.shippingZip,
    },
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      sku: item.variant.sku,
      product: {
        id: item.variant.product.id,
        slug: item.variant.product.slug,
        name: item.variant.product.name,
      },
      variant: {
        id: item.variant.id,
        size: item.variant.size,
        color: item.variant.color,
      },
    })),
    invoice: {
      status: order.invoiceStatus,
    },
  };
}
