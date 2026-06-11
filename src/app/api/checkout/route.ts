import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPaymentPreference } from "@/lib/mercadopago";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-paid-order";
import { getStoreId } from "@/lib/store-context";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
  }),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { customer, items } = parsed.data;
    const storeId = await getStoreId();

    const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });

    const variants = await db.productVariant.findMany({
      where: {
        id: { in: items.map((i) => i.variantId) },
        product: { storeId },
      },
      include: { product: true },
    });

    if (variants.length !== items.length) {
      return NextResponse.json({ error: "Productos no válidos" }, { status: 400 });
    }

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Sin stock para ${variant?.product.name ?? "producto"}` },
          { status: 400 },
        );
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + Number(variant.price) * item.quantity;
    }, 0);

    const shippingCost = Number(store.shippingFlatRate);
    const total = subtotal + shippingCost;

    const order = await db.order.create({
      data: {
        storeId,
        total,
        shippingCost,
        customerName: customer.name as string,
        customerEmail: customer.email as string,
        customerPhone: customer.phone as string,
        shippingAddress: customer.address as string,
        shippingCity: customer.city as string,
        shippingZip: customer.zip as string,
        items: {
          create: items.map((item) => {
            const variant = variants.find((v) => v.id === item.variantId)!;
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: variant.price,
            };
          }),
        },
      },
    });

    const mpItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return {
        id: item.variantId,
        title: `${variant.product.name} (${variant.size} / ${variant.color})`,
        quantity: item.quantity,
        unit_price: Number(variant.price),
      };
    });

    if (shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: "Envío",
        quantity: 1,
        unit_price: shippingCost,
      });
    }

    const hasMpToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN &&
      !process.env.MERCADOPAGO_ACCESS_TOKEN.includes("your-access-token");

    if (!hasMpToken) {
      const fulfillment = await fulfillPaidOrder(order.id);

      return NextResponse.json({
        demoMode: true,
        orderId: order.id,
        emailMode: fulfillment.emailMode ?? "demo-log",
      });
    }

    const preference = await createPaymentPreference({
      orderId: order.id,
      items: mpItems,
      payerEmail: customer.email as string,
      payerName: customer.name as string,
    });

    await db.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
    });

    return NextResponse.json({
      initPoint: preference.init_point,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Error al procesar el checkout" },
      { status: 500 },
    );
  }
}
