import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { formatMercadoEnviosDeliveryWindow } from "@/lib/mercado-envios";
import {
  estimateOrderSubtotalForQuote,
  quoteCheckoutShipping,
} from "@/lib/shipping-carriers/resolve-shipping";
import { getStoreId } from "@/lib/store-context";

const quoteSchema = z.object({
  zip: z.string().min(4),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Código postal inválido" }, { status: 400 });
    }

    const storeId = await getStoreId();
    const items = parsed.data.items ?? [];
    const orderSubtotal =
      items.length > 0
        ? await estimateOrderSubtotalForQuote(storeId, items)
        : undefined;

    const quote = await quoteCheckoutShipping({
      storeId,
      zip: parsed.data.zip.trim(),
      items,
      orderSubtotal,
    });

    if (!quote) {
      return NextResponse.json(
        { error: "La cotización carrier no está disponible en esta tienda." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      cost: quote.cost,
      carrier: quote.carrier,
      service: quote.service,
      deliveryWindow: formatMercadoEnviosDeliveryWindow(
        quote.deliveryDaysMin,
        quote.deliveryDaysMax,
      ),
      estimatedDelivery: quote.estimatedDelivery.toISOString(),
      demoMode: quote.demoMode,
      source: quote.source,
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json(
      { error: "No se pudo cotizar el envío" },
      { status: 500 },
    );
  }
}
