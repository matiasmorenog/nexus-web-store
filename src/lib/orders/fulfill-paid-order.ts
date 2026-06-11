import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { buildOrderEmailData } from "@/lib/emails/order-email-data";
import { sendOrderEmails } from "@/lib/emails/send-order-emails";
import { getMerchantEmail } from "@/lib/merchant-email";

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
    });
  }

  const merchantEmail = await getMerchantEmail(order.storeId);
  const emailData = buildOrderEmailData(order);
  const emailResult = await sendOrderEmails(emailData, merchantEmail);

  await markConfirmationEmailSent(orderId);

  return {
    alreadyFulfilled: false as const,
    orderId,
    emailMode: emailResult.mode,
  };
}
