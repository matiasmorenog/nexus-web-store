import { andreaniAdapter } from "@/lib/shipping-carriers/adapters/andreani";
import { correoMiCorreoAdapter } from "@/lib/shipping-carriers/adapters/correo-micorreo";
import { mercadoEnviosAdapter } from "@/lib/shipping-carriers/adapters/mercado-envios";
import type { ShippingCarrierAdapter } from "@/lib/shipping-carriers/adapters/types";
import type { ShippingCarrierId } from "@/lib/shipping-carriers/carrier-catalog";

const ADAPTERS: Record<ShippingCarrierId, ShippingCarrierAdapter> = {
  mercado_envios: mercadoEnviosAdapter,
  correo_argentino: correoMiCorreoAdapter,
  andreani: andreaniAdapter,
};

export function getCarrierAdapter(
  carrierId: ShippingCarrierId,
): ShippingCarrierAdapter {
  return ADAPTERS[carrierId];
}

export function listCarrierAdapters(): ShippingCarrierAdapter[] {
  return Object.values(ADAPTERS);
}

export type {
  CarrierQuoteInput,
  CarrierQuoteResult,
  CarrierShipmentOrderInput,
  CarrierShipmentResult,
  ShippingCarrierAdapter,
} from "@/lib/shipping-carriers/adapters/types";
