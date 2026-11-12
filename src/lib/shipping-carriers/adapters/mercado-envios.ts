import "server-only";

import { quoteMercadoEnviosFromApi } from "@/lib/mercado-envios/api-client";
import { getShippingCarrier } from "@/lib/shipping-carriers/carrier-catalog";
import { getMercadoEnviosCredentials } from "@/lib/shipping-carriers/credentials";
import type {
  CarrierQuoteInput,
  CarrierQuoteResult,
  CarrierShipmentOrderInput,
  CarrierShipmentResult,
  ShippingCarrierAdapter,
} from "@/lib/shipping-carriers/adapters/types";

export const mercadoEnviosAdapter: ShippingCarrierAdapter = {
  id: "mercado_envios",
  label: getShippingCarrier("mercado_envios").label,

  async isConfigured(storeId) {
    const creds = await getMercadoEnviosCredentials(storeId);
    return creds.source !== "none";
  },

  async quote(input: CarrierQuoteInput): Promise<CarrierQuoteResult> {
    const creds = await getMercadoEnviosCredentials(input.storeId);
    if (!creds.accessToken) {
      throw new Error("Mercado Envíos no está configurado.");
    }

    const apiQuote = await quoteMercadoEnviosFromApi({
      accessToken: creds.accessToken,
      destinationZip: input.destinationZip,
      originZip: input.originZip,
      carrierId: "mercado_envios",
      mercadoLibreQuoteItemId: input.mercadoLibreQuoteItemId,
      totalWeightGrams: input.totalWeightGrams,
      orderSubtotal: input.orderSubtotal ?? 10000,
    });

    if (!apiQuote) {
      throw new Error(
        "Mercado Libre no devolvió opciones de envío para ese CP. Revisá token, CP origen e ítem MLA.",
      );
    }

    return {
      carrierId: "mercado_envios",
      carrier: getShippingCarrier("mercado_envios").label,
      service: apiQuote.service,
      cost: apiQuote.cost,
      deliveryDaysMin: apiQuote.deliveryDaysMin,
      deliveryDaysMax: apiQuote.deliveryDaysMax,
      estimatedDelivery: apiQuote.estimatedDelivery,
      sandbox: creds.accessToken.startsWith("TEST-"),
      source: "api",
    };
  },

  async createShipment(
    input: CarrierShipmentOrderInput,
  ): Promise<CarrierShipmentResult> {
    const creds = await getMercadoEnviosCredentials(input.storeId);
    if (!creds.accessToken) {
      throw new Error("Mercado Envíos no está configurado.");
    }

    // ML does not expose a stable public “create shipment for external cart”
    // endpoint comparable to MiCorreo/Andreani. Fail explicitly so the merchant
    // can finish fulfillment in Mercado Libre / Flex instead of fake tracking.
    void input;
    throw new Error(
      "Crear guía automática vía Mercado Envíos aún requiere una venta/logística ML activa. Cotización sí funciona con el token; generá el envío desde Mercado Libre o cargá el tracking manualmente en el pedido.",
    );
  },
};

