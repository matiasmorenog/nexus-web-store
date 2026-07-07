import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { buildOrderEmailData } from "@/lib/emails/order-email-data";
import { sendOrderEmails } from "@/lib/emails/send-order-emails";
import { getMerchantEmail } from "@/lib/merchant-email";
import { createOrderShipment } from "@/lib/orders/create-order-shipment";
import { revalidateAdminDashboardCache } from "@/lib/revalidate-admin-cache";
import { revalidateStorefrontStockSurfaces } from "@/lib/revalidate-storefront-products";

const orderInclude = {
  store: true,
  items: {
    include: {
      variant: {
        include: { product: true },
      },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

type OrderForFulfillment = OrderWithDetails & {
  confirmationEmailSentAt: Date | null;
};

async function markConfirmationEmailSent(orderId: string) {
  const data = {
    confirmationEmailSentAt: new Date(),
  } as Prisma.OrderUncheckedUpdateInput;

  await db.order.update({
    where: { id: orderId },
    data,
  });
}

export async function fulfillPaidOrder(orderId: string) {
  const order = (await db.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  })) as OrderForFulfillment | null;

  if (!order) {
    throw new Error("Pedido no encontrado");
  }

  if (order.confirmationEmailSentAt) {
    return { alreadyFulfilled: true as const, orderId };
  }

  const wasAlreadyPaid = order.status === "PAID";

  if (!wasAlreadyPaid) {
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
    });

    const productSlugs = [
      ...new Set(order.items.map((item) => item.variant.product.slug)),
    ];
    revalidateStorefrontStockSurfaces(productSlugs);
    revalidateAdminDashboardCache(order.storeId);
  }

  await createOrderShipment({
    id: order.id,
    isPickup: order.isPickup,
    shippingZip: order.shippingZip,
    meShipmentId: order.meShipmentId,
  }).catch((error) => {
    console.error("Mercado Envíos shipment error:", error);
  });

  const orderForEmail = (await db.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  })) as OrderForFulfillment | null;

  if (!orderForEmail) {
    throw new Error("Pedido no encontrado");
  }

  const merchantEmail = await getMerchantEmail(orderForEmail.storeId);
  const emailData = buildOrderEmailData(orderForEmail);
  const emailResult = await sendOrderEmails(emailData, merchantEmail);

  await markConfirmationEmailSent(orderId);

  return {
    alreadyFulfilled: false as const,
    orderId,
    emailMode: emailResult.mode,
  };
}
