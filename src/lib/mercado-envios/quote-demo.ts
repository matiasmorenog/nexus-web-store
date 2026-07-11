import type { MercadoEnviosCarrierId } from "@/lib/mercado-envios/types";

type ZoneQuote = {
  baseCost: number;
  daysMin: number;
  daysMax: number;
  zoneLabel: string;
};

function normalizeZipDigits(zip: string) {
  return zip.replace(/\D/g, "").slice(0, 8);
}

/** Zonas aproximadas Argentina (ARS) para demo sin API ML. */
function resolveArgentinaZone(zipDigits: string): ZoneQuote {
  const prefix = parseInt(zipDigits.slice(0, 4), 10) || 1000;

  if (prefix >= 1000 && prefix <= 1439) {
    return { baseCost: 4500, daysMin: 2, daysMax: 4, zoneLabel: "CABA" };
  }
  if (prefix >= 1600 && prefix <= 1899) {
    return { baseCost: 5800, daysMin: 3, daysMax: 5, zoneLabel: "GBA" };
  }
  if (prefix >= 1900 && prefix <= 1999) {
    return { baseCost: 6200, daysMin: 3, daysMax: 6, zoneLabel: "Buenos Aires" };
  }
  if (prefix >= 2000 && prefix <= 3099) {
    return { baseCost: 7800, daysMin: 4, daysMax: 7, zoneLabel: "Centro/Litoral" };
  }
  if (prefix >= 4000 && prefix <= 4999) {
    return { baseCost: 9200, daysMin: 5, daysMax: 8, zoneLabel: "NOA" };
  }
  if (prefix >= 5000 && prefix <= 5999) {
    return { baseCost: 8800, daysMin: 5, daysMax: 8, zoneLabel: "Cuyo/Córdoba" };
  }
  if (prefix >= 8000 && prefix <= 9499) {
    return { baseCost: 11500, daysMin: 6, daysMax: 10, zoneLabel: "Patagonia" };
  }

  return { baseCost: 9800, daysMin: 5, daysMax: 9, zoneLabel: "Interior" };
}

function distanceSurcharge(originZip: string | null | undefined, destZip: string) {
  const origin = parseInt(normalizeZipDigits(originZip ?? "1425"), 10) || 1425;
  const dest = parseInt(normalizeZipDigits(destZip), 10) || 1000;
  const delta = Math.abs(dest - origin);
  return Math.round(Math.min(delta * 0.35, 2500));
}

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function quoteMercadoEnviosDemo({
  destinationZip,
  originZip,
  carrierId = "mercado_envios",
  totalWeightGrams = 500,
  itemCount = 1,
}: {
  destinationZip: string;
  originZip?: string | null;
  carrierId?: MercadoEnviosCarrierId;
  totalWeightGrams?: number;
  itemCount?: number;
}) {
  const zipDigits = normalizeZipDigits(destinationZip);
  const zone = resolveArgentinaZone(zipDigits);
  const weightExtra = Math.max(0, totalWeightGrams - 500) * 6;
  const multiItemExtra = Math.max(0, itemCount - 1) * 450;
  const distanceExtra = distanceSurcharge(originZip, zipDigits);
  const carrierMultiplier = carrierId === "correo_argentino" ? 1.06 : 1;

  const cost = Math.round(
    (zone.baseCost + weightExtra + multiItemExtra + distanceExtra) * carrierMultiplier,
  );

  return {
    cost,
    carrier:
      carrierId === "correo_argentino" ? "Correo Argentino" : "Mercado Envíos",
    service:
      carrierId === "correo_argentino"
        ? "Correo Argentino vía Mercado Envíos"
        : `Envío a domicilio · ${zone.zoneLabel}`,
    deliveryDaysMin: zone.daysMin,
    deliveryDaysMax: zone.daysMax,
    estimatedDelivery: addCalendarDays(new Date(), zone.daysMax),
    demoMode: true as const,
    source: "demo" as const,
  };
}
