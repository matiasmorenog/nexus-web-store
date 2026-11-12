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

/** Unique valid carrier ids, preserving order. */
export function normalizeEnabledCarrierIds(
  values: readonly string[] | null | undefined,
  fallbackPreferred?: string | null,
): MercadoEnviosCarrierId[] {
  const seen = new Set<MercadoEnviosCarrierId>();
  const result: MercadoEnviosCarrierId[] = [];

  for (const raw of values ?? []) {
    if (!isMercadoEnviosCarrierId(raw) || seen.has(raw)) continue;
    seen.add(raw);
    result.push(raw);
  }

  if (result.length > 0) return result;

  // Explicit empty array = none enabled (not a legacy row).
  if (Array.isArray(values) && values.length === 0) {
    return [];
  }

  const preferred = normalizePreferredCarrierId(fallbackPreferred ?? "");
  return preferred ? [preferred] : [];
}

export const SHIPPING_CARRIER_OPTIONS = Object.values(MERCADO_ENVIOS_CARRIERS).map(
  (carrier) => ({
    id: carrier.id,
    label: carrier.label,
  }),
);
