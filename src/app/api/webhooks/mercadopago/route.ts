import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { db } from "@/lib/db";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-paid-order";
import { resolveMercadoPagoAccessToken } from "@/lib/payments/server";
import { getStoreId } from "@/lib/store-context";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type !== "payment" || !data?.id) {
      return NextResponse.json({ received: true });
    }

    const storeId = await getStoreId();
    const accessToken = await resolveMercadoPagoAccessToken(storeId);
    if (!accessToken) {
      return NextResponse.json({ error: "MP not configured" }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: data.id });

    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ received: true });
    }

    if (payment.status === "approved") {
      await db.order.update({
        where: { id: orderId },
        data: { mpPaymentId: String(payment.id) },
      });
      await fulfillPaidOrder(orderId);
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await db.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
