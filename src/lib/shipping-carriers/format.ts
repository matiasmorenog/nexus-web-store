import {
  isShippingCarrierId,
  SHIPPING_CARRIERS,
  type ShippingCarrierId,
} from "@/lib/shipping-carriers/carrier-catalog";

/** @deprecated Prefer isShippingCarrierId */
export function isMercadoEnviosCarrierId(
  value: string,
): value is ShippingCarrierId {
  return isShippingCarrierId(value);
}

export function normalizePreferredCarrierId(
  value: string,
): ShippingCarrierId | null {
  const id = value.trim();
  return isShippingCarrierId(id) ? id : null;
}

/** Unique valid carrier ids, preserving order. */
export function normalizeEnabledCarrierIds(
  values: readonly string[] | null | undefined,
  fallbackPreferred?: string | null,
): ShippingCarrierId[] {
  const seen = new Set<ShippingCarrierId>();
  const result: ShippingCarrierId[] = [];

  for (const raw of values ?? []) {
    if (!isShippingCarrierId(raw) || seen.has(raw)) continue;
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

export const SHIPPING_CARRIER_OPTIONS = Object.values(SHIPPING_CARRIERS).map(
  (carrier) => ({
    id: carrier.id,
    label: carrier.label,
  }),
);

export function formatShippingDeliveryWindow(
  daysMin: number,
  daysMax: number,
): string {
  if (daysMin === daysMax) {
    return daysMin === 1 ? "1 día hábil" : `${daysMin} días hábiles`;
  }
  return `${daysMin}–${daysMax} días hábiles`;
}
