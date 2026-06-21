import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  formatMercadoEnviosDeliveryWindow,
  quoteMercadoEnvios,
} from "@/lib/mercado-envios";
import { getStoreId } from "@/lib/store-context";

const quoteSchema = z.object({
  zip: z.string().min(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Código postal inválido" }, { status: 400 });
    }

    const storeId = await getStoreId();
    const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });
    const quote = quoteMercadoEnvios({
      zip: parsed.data.zip.trim(),
      baseRate: Number(store.shippingFlatRate),
    });

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
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json(
      { error: "No se pudo cotizar el envío" },
      { status: 500 },
    );
  }
}
