import { quoteMercadoEnviosDemo } from "@/lib/mercado-envios/quote-demo";
import type {
  MercadoEnviosCarrier,
  MercadoEnviosCarrierId,
  MercadoEnviosQuote,
  MercadoEnviosShipment,
} from "@/lib/mercado-envios/types";

export type {
  MercadoEnviosCarrierId,
  MercadoEnviosQuote,
  MercadoEnviosCarrier,
  MercadoEnviosShipment,
} from "@/lib/mercado-envios/types";

/** Portales reales donde el comprador consulta el código de seguimiento. */
export const MERCADO_ENVIOS_CARRIERS: Record<
  MercadoEnviosCarrierId,
  MercadoEnviosCarrier
> = {
  mercado_envios: {
    id: "mercado_envios",
    label: "Mercado Envíos",
    trackingPortalUrl: "https://www.mercadolibre.com.ar/ventas/envios",
    trackingPortalLabel: "Rastrear en Mercado Envíos",
    trackingHint:
      "Ingresá con la cuenta de Mercado Libre vinculada a la tienda para ver el envío.",
  },
  correo_argentino: {
    id: "correo_argentino",
    label: "Correo Argentino",
    trackingPortalUrl:
      "https://www.correoargentino.com.ar/formularios/mercadolibre",
    trackingPortalLabel: "Rastrear en Correo Argentino",
    trackingHint:
      "En el formulario oficial, elegí MercadoLibre e ingresá el código de 18 caracteres.",
  },
};

const TRACKING_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** @deprecated Usar quoteMercadoEnvios async con CP destino. */
export function quoteMercadoEnviosSync({
  zip,
  baseRate,
  carrierId = "mercado_envios",
}: {
  zip: string;
  baseRate: number;
  carrierId?: MercadoEnviosCarrierId;
}): MercadoEnviosQuote {
  return quoteMercadoEnviosDemo({
    destinationZip: zip,
    carrierId,
    totalWeightGrams: 500,
  });
}

export function generateMercadoEnviosShipmentId(orderId: string) {
  return String(10000000000 + (hashString(orderId) % 89999999999));
}

export function generateMercadoEnviosTrackingNumber(orderId: string) {
  let hash = hashString(orderId);
  let code = "";

  for (let i = 0; i < 18; i += 1) {
    code += TRACKING_ALPHABET[hash % TRACKING_ALPHABET.length];
    hash = Math.floor(hash / TRACKING_ALPHABET.length) + hashString(`${orderId}-${i}`);
  }

  return code;
}

export function getMercadoEnviosCarrier(
  carrierId: MercadoEnviosCarrierId = "mercado_envios",
): MercadoEnviosCarrier {
  return MERCADO_ENVIOS_CARRIERS[carrierId];
}

export function resolveMercadoEnviosCarrierId(
  carrierLabel: string | null | undefined,
  fallback: MercadoEnviosCarrierId = "mercado_envios",
): MercadoEnviosCarrierId {
  if (!carrierLabel?.trim()) return fallback;

  for (const carrier of Object.values(MERCADO_ENVIOS_CARRIERS)) {
    if (carrier.label === carrierLabel.trim()) {
      return carrier.id;
    }
  }

  return fallback;
}

export function resolveMercadoEnviosTrackingUrl({
  trackingUrl,
  carrierId = "mercado_envios",
}: {
  trackingUrl?: string | null;
  carrierId?: MercadoEnviosCarrierId;
}) {
  if (trackingUrl?.trim()) {
    return trackingUrl.trim();
  }

  return getMercadoEnviosCarrier(carrierId).trackingPortalUrl;
}

export function createMercadoEnviosShipmentDemo({
  orderId,
  zip,
  carrierId = "mercado_envios",
}: {
  orderId: string;
  zip: string;
  carrierId?: MercadoEnviosCarrierId;
}): MercadoEnviosShipment {
  const quote = quoteMercadoEnviosDemo({
    destinationZip: zip,
    carrierId,
  });
  const carrier = getMercadoEnviosCarrier(carrierId);
  const trackingNumber = generateMercadoEnviosTrackingNumber(orderId);
  const trackingUrl = resolveMercadoEnviosTrackingUrl({ carrierId });

  return {
    shipmentId: generateMercadoEnviosShipmentId(orderId),
    trackingNumber,
    carrier: carrier.label,
    carrierId,
    status: "IN_TRANSIT",
    estimatedDelivery: quote.estimatedDelivery,
    trackingUrl,
    trackingPortalLabel: carrier.trackingPortalLabel,
    trackingHint: carrier.trackingHint,
    demoMode: true,
  };
}

export function formatMercadoEnviosDeliveryWindow(
  minDays: number,
  maxDays: number,
) {
  if (minDays === maxDays) {
    return `${minDays} día${minDays !== 1 ? "s" : ""} hábiles`;
  }

  return `${minDays} a ${maxDays} días hábiles`;
}

export function formatMercadoEnviosDate(date: Date) {
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export { isMercadoEnviosConfigured } from "@/lib/mercado-envios/server";
