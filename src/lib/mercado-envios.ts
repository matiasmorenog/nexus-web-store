export type MercadoEnviosQuote = {
  cost: number;
  carrier: string;
  service: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  estimatedDelivery: Date;
  demoMode: boolean;
};

export type MercadoEnviosCarrierId = "correo_argentino";

export type MercadoEnviosCarrier = {
  id: MercadoEnviosCarrierId;
  label: string;
  trackingPortalUrl: string;
  trackingPortalLabel: string;
  trackingHint: string;
};

export type MercadoEnviosShipment = {
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  carrierId: MercadoEnviosCarrierId;
  status: "READY_TO_SHIP" | "IN_TRANSIT";
  estimatedDelivery: Date;
  trackingUrl: string;
  trackingPortalLabel: string;
  trackingHint: string;
  demoMode: boolean;
};

/** Portales reales donde el comprador consulta el código de seguimiento. */
export const MERCADO_ENVIOS_CARRIERS: Record<
  MercadoEnviosCarrierId,
  MercadoEnviosCarrier
> = {
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

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isMercadoEnviosConfigured() {
  const token = process.env.MERCADOENVIOS_ACCESS_TOKEN;
  return Boolean(token && !token.includes("your-access-token"));
}

export function quoteMercadoEnvios({
  zip,
  baseRate,
}: {
  zip: string;
  baseRate: number;
}): MercadoEnviosQuote {
  const zipDigits = zip.replace(/\D/g, "");
  const zipNum = parseInt(zipDigits.slice(0, 4), 10) || 1000;
  const multiplier = 1 + (zipNum % 7) * 0.015;
  const cost = Math.round(Math.max(baseRate, 0) * multiplier);
  const deliveryDaysMin = 3 + (zipNum % 2);
  const deliveryDaysMax = deliveryDaysMin + 2;

  return {
    cost,
    carrier: "Mercado Envíos",
    service: "Envío a domicilio",
    deliveryDaysMin,
    deliveryDaysMax,
    estimatedDelivery: addCalendarDays(new Date(), deliveryDaysMax),
    demoMode: !isMercadoEnviosConfigured(),
  };
}

/** ID numérico de envío, como en la API de Mercado Libre. */
export function generateMercadoEnviosShipmentId(orderId: string) {
  return String(10000000000 + (hashString(orderId) % 89999999999));
}

/**
 * Código de 18 caracteres alfanuméricos, formato usado por Mercado Libre
 * en el portal de Correo Argentino.
 */
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
  carrierId: MercadoEnviosCarrierId = "correo_argentino",
): MercadoEnviosCarrier {
  return MERCADO_ENVIOS_CARRIERS[carrierId];
}

/**
 * Resuelve la URL de rastreo. Mercado Libre no expone un link público genérico;
 * en producción se guarda la URL del transportista que devuelve la API.
 */
export function resolveMercadoEnviosTrackingUrl({
  trackingUrl,
  carrierId = "correo_argentino",
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
  carrierId = "correo_argentino",
}: {
  orderId: string;
  zip: string;
  carrierId?: MercadoEnviosCarrierId;
}): MercadoEnviosShipment {
  const quote = quoteMercadoEnvios({ zip, baseRate: 0 });
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

export async function createMercadoEnviosShipment({
  orderId,
  zip,
}: {
  orderId: string;
  zip: string;
}): Promise<MercadoEnviosShipment> {
  if (isMercadoEnviosConfigured()) {
    throw new Error("Mercado Envíos real aún no está implementado");
  }

  return createMercadoEnviosShipmentDemo({ orderId, zip });
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
