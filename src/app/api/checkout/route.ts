import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { formatStoreName } from "@/lib/brand";
import { normalizeCouponCode } from "@/lib/coupons/format";
import { validateCouponForCheckout } from "@/lib/coupons/validate";
import { db } from "@/lib/db";
import { createPaymentPreference } from "@/lib/mercadopago";
import { storeHasModule } from "@/lib/modules";
import { resolveCheckoutShippingCost } from "@/lib/shipping-carriers/resolve-shipping";
import { fulfillPaidOrder } from "@/lib/orders/fulfill-paid-order";
import {
  getMercadoPagoUnitPriceFromPricing,
  pricePromo2x1Lines,
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
    couponCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod !== "shipping") return;

    const labels: Record<"address" | "city" | "zip", string> = {
      address: "dirección",
      city: "ciudad",
      zip: "código postal",
    };

    for (const field of ["address", "city", "zip"] as const) {
      if (!data.customer[field]?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: `Completá ${labels[field]} para envío a domicilio`,
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
      const message =
        parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { customer, items, deliveryMethod, couponCode } = parsed.data;
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
        productId: variant.product.id,
        lineKey: item.variantId,
      };
    });

    const promoPricing = pricePromo2x1Lines(promoLines);
    const { rawSubtotal, promoDiscount, subtotal } = promoPricing;

    let couponId: string | undefined;
    let resolvedCouponCode: string | undefined;
    let couponDiscount = 0;

    const normalizedCouponCode = couponCode
      ? normalizeCouponCode(couponCode)
      : "";

    if (normalizedCouponCode) {
      if (!(await storeHasModule(storeId, "coupons"))) {
        return NextResponse.json(
          { error: "Los cupones no están disponibles en esta tienda." },
          { status: 400 },
        );
      }

      const coupon = await db.coupon.findUnique({
        where: {
          storeId_code: {
            storeId,
            code: normalizedCouponCode,
          },
        },
      });

      const couponResult = validateCouponForCheckout(
        coupon,
        normalizedCouponCode,
        subtotal,
      );

      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.message }, { status: 400 });
      }

      couponId = couponResult.couponId;
      resolvedCouponCode = couponResult.code;
      couponDiscount = couponResult.discount;
    }

    const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    const promoByVariant = new Map(
      promoPricing.lines
        .filter((line) => line.lineKey)
        .map((line) => [line.lineKey!, line]),
    );
    const shippingCost = await resolveCheckoutShippingCost({
      storeId,
      zip: customer.zip!.trim(),
      flatRate: Number(store.shippingFlatRate),
      isPickup,
    });
    const total = subtotalAfterCoupon + shippingCost;

    const session = await auth();
    const customerUserId =
      session?.user?.role === "CUSTOMER" ? session.user.id : undefined;

    const order = await db.order.create({
      data: {
        storeId,
        userId: customerUserId,
        total,
        promoDiscount,
        couponId,
        couponCode: resolvedCouponCode,
        couponDiscount,
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
      const linePricing = promoByVariant.get(item.variantId);
      const unitPrice = linePricing
        ? getMercadoPagoUnitPriceFromPricing(linePricing.lineTotal, item.quantity)
        : Number(variant.price);

      return {
        id: item.variantId,
        title: `${variant.product.name} (${variant.size} / ${variant.color})`,
        quantity: item.quantity,
        unit_price: unitPrice,
      };
    });

    const mpItemsTotal = mpItems.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
    const mpAdjustment =
      Math.round((subtotalAfterCoupon - mpItemsTotal) * 100) / 100;
    if (mpAdjustment !== 0 && mpItems[0]) {
      mpItems[0].unit_price =
        Math.round((mpItems[0].unit_price + mpAdjustment / mpItems[0].quantity) * 100) /
        100;
    }

    void rawSubtotal; // subtotal neto ya incluido en total del pedido

    if (shippingCost > 0) {
      mpItems.push({
        id: "shipping",
        title: "Envío (Mercado Envíos)",
        quantity: 1,
        unit_price: shippingCost,
      });
    }

    const hasMpToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN &&
      !process.env.MERCADOPAGO_ACCESS_TOKEN.includes("your-access-token");

    if (!hasMpToken) {
      let fulfillment;
      try {
        fulfillment = await fulfillPaidOrder(order.id);
      } catch (fulfillError) {
        console.error("Fulfillment error:", fulfillError);
        return NextResponse.json(
          {
            error:
              "El pedido se creó pero no se pudo completar. Si acabás de actualizar el proyecto, ejecutá `npx prisma db push` e intentá de nuevo.",
          },
          { status: 500 },
        );
      }

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
