import { MERCADO_ENVIOS_CARRIERS } from "@/lib/mercado-envios";
import type { MercadoEnviosCarrierId } from "@/lib/mercado-envios/types";

export function isMercadoEnviosCarrierId(
  value: string,
): value is MercadoEnviosCarrierId {
  return value in MERCADO_ENVIOS_CARRIERS;
}

export function normalizePreferredCarrierId(
  value: string,
): MercadoEnviosCarrierId | null {
  const id = value.trim();
  return isMercadoEnviosCarrierId(id) ? id : null;
}

export const SHIPPING_CARRIER_OPTIONS = Object.values(MERCADO_ENVIOS_CARRIERS).map(
  (carrier) => ({
    id: carrier.id,
    label: carrier.label,
  }),
);
