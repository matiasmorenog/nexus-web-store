import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { formatStoreName } from "@/lib/brand";
import { db } from "@/lib/db";
import { createPaymentPreference } from "@/lib/mercadopago";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-paid-order";
import {
  getMercadoPagoUnitPrice,
  sumPromo2x1Cart,
} from "@/lib/promo-2x1";
import { getStoreId } from "@/lib/store-context";

const checkoutSchema = z
  .object({
    deliveryMethod: z.enum(["shipping", "pickup"]).default("shipping"),
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().min(1),
      address: z.string().optional(),
      city: z.string().optional(),
      zip: z.string().optional(),
    }),
    items: z.array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "shipping") return;

    for (const field of ["address", "city", "zip"] as const) {
      if (!data.customer[field]?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: `El campo ${field} es obligatorio para envío a domicilio`,
          path: ["customer", field],
        });
      }
    }
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { customer, items, deliveryMethod } = parsed.data;
    const storeId = await getStoreId();

    const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });

    const isPickup = deliveryMethod === "pickup";

    if (isPickup && !store.allowPickup) {
      return NextResponse.json(
        { error: "El retiro en local no está disponible" },
        { status: 400 },
      );
    }

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

    const promoLines = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return {
        unitPrice: Number(variant.price),
        quantity: item.quantity,
        productPromo2x1: variant.product.promo2x1,
      };
    });

    const { rawSubtotal, promoDiscount, subtotal } = sumPromo2x1Cart(promoLines);
    const shippingCost = isPickup ? 0 : Number(store.shippingFlatRate);
    const total = subtotal + shippingCost;

    const order = await db.order.create({
      data: {
        storeId,
        total,
        promoDiscount,
        shippingCost,
        isPickup,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: isPickup
          ? "Retiro en local"
          : customer.address!.trim(),
        shippingCity: isPickup ? formatStoreName(store.name) : customer.city!.trim(),
        shippingZip: isPickup ? "—" : customer.zip!.trim(),
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
        unit_price: getMercadoPagoUnitPrice({
          unitPrice: Number(variant.price),
          quantity: item.quantity,
          productPromo2x1: variant.product.promo2x1,
        }),
      };
    });

    const mpItemsTotal = mpItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const mpAdjustment = Math.round((subtotal - mpItemsTotal) * 100) / 100;
    if (mpAdjustment !== 0 && mpItems[0]) {
      mpItems[0].unit_price =
        Math.round((mpItems[0].unit_price + mpAdjustment / mpItems[0].quantity) * 100) /
        100;
    }

    void rawSubtotal; // subtotal neto ya incluido en total del pedido

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
      payerEmail: customer.email,
      payerName: customer.name,
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
