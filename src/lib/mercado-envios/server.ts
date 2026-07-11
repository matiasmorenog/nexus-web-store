import "server-only";

import {
  getEnvMercadoEnviosDedicatedAccessToken,
  quoteMercadoEnviosFromApi,
} from "@/lib/mercado-envios/api-client";
import {
  createMercadoEnviosShipmentDemo,
} from "@/lib/mercado-envios";
import {
  getMercadoEnviosTokenSource,
  resolveMercadoEnviosAccessToken,
} from "@/lib/mercado-envios/resolve-token";
import { quoteMercadoEnviosDemo } from "@/lib/mercado-envios/quote-demo";
import type {
  MercadoEnviosCarrierId,
  MercadoEnviosQuote,
  MercadoEnviosQuoteInput,
  MercadoEnviosShipment,
} from "@/lib/mercado-envios/types";

export type {
  MercadoEnviosCarrierId,
  MercadoEnviosQuote,
  MercadoEnviosShipment,
} from "@/lib/mercado-envios/types";

export {
  getMercadoEnviosTokenSource,
  resolveMercadoEnviosAccessToken,
} from "@/lib/mercado-envios/resolve-token";

export function isMercadoEnviosConfigured() {
  return Boolean(getEnvMercadoEnviosDedicatedAccessToken());
}

export async function isMercadoEnviosConfiguredForStore(storeId: string) {
  const source = await getMercadoEnviosTokenSource(storeId);
  return source !== "none";
}

export async function quoteMercadoEnvios(
  input: MercadoEnviosQuoteInput,
): Promise<MercadoEnviosQuote> {
  const {
    storeId,
    destinationZip,
    originZip,
    carrierId = "mercado_envios",
    mercadoLibreQuoteItemId,
    defaultWeightGrams = 500,
    totalWeightGrams,
    itemCount = 1,
    orderSubtotal = 10000,
  } = input;

  const weight =
    totalWeightGrams ?? defaultWeightGrams * Math.max(1, itemCount);
  const accessToken = await resolveMercadoEnviosAccessToken(storeId);

  if (accessToken) {
    const apiQuote = await quoteMercadoEnviosFromApi({
      accessToken,
      destinationZip,
      originZip,
      carrierId,
      mercadoLibreQuoteItemId,
      totalWeightGrams: weight,
      orderSubtotal,
    });

    if (apiQuote) {
      return {
        ...apiQuote,
        demoMode: false,
        source: "mercado_libre",
      };
    }
  }

  const demoQuote = quoteMercadoEnviosDemo({
    destinationZip,
    originZip,
    carrierId,
    totalWeightGrams: weight,
    itemCount,
  });

  if (demoQuote.cost > 0) {
    return demoQuote;
  }

  return {
    ...demoQuote,
    source: "fallback",
  };
}

export async function createMercadoEnviosShipment({
  orderId,
  zip,
  carrierId = "mercado_envios",
}: {
  orderId: string;
  zip: string;
  carrierId?: MercadoEnviosCarrierId;
}): Promise<MercadoEnviosShipment> {
  if (getEnvMercadoEnviosDedicatedAccessToken()) {
    throw new Error("Mercado Envíos real aún no está implementado para crear envíos");
  }

  return createMercadoEnviosShipmentDemo({ orderId, zip, carrierId });
}
