import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";
import { getOrderPaymentInfo } from "@/lib/order-payment";
import { getOrderShippingInfo } from "@/lib/order-shipping";

const orderListInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: { select: { name: true, slug: true } },
        },
      },
    },
  },
} as const;

function customerOrderWhere(storeId: string, userId: string, email: string) {
  return {
    storeId,
    OR: [{ userId }, { customerEmail: email }],
  };
}

export const getCustomerOrders = cache(async (userId: string, email: string) => {
  const storeId = await getStoreId();

  return db.order.findMany({
    where: customerOrderWhere(storeId, userId, email),
    orderBy: { createdAt: "desc" },
    include: orderListInclude,
  });
});

export const getCustomerOrderById = cache(
  async (orderId: string, userId: string, email: string) => {
    const storeId = await getStoreId();

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        ...customerOrderWhere(storeId, userId, email),
      },
      include: orderListInclude,
    });

    if (!order) {
      notFound();
    }

    return {
      ...order,
      payment: getOrderPaymentInfo(order),
      shipping: getOrderShippingInfo(order),
    };
  },
);
