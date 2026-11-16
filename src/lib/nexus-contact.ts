import {
  buildWhatsAppUrl,
  isValidWhatsAppPhone,
  normalizeWhatsAppPhone,
} from "@/lib/marketing/format";

/**
 * Matías — soporte comercial Nexus (todas las tiendas).
 * Override: NEXT_PUBLIC_NEXUS_PLAN_WHATSAPP
 */
const DEFAULT_NEXUS_SALES_WHATSAPP = "5491163537809";

export function getNexusSalesWhatsAppPhone(): string {
  const fromEnv = process.env.NEXT_PUBLIC_NEXUS_PLAN_WHATSAPP?.trim();
  if (fromEnv && isValidWhatsAppPhone(fromEnv)) {
    return normalizeWhatsAppPhone(fromEnv);
  }
  return DEFAULT_NEXUS_SALES_WHATSAPP;
}

export function nexusPlanRequestUrl(
  tierName: string,
  monthlyPriceUsd: number,
): string {
  return buildWhatsAppUrl(
    getNexusSalesWhatsAppPhone(),
    `Hola, quiero activar el plan ${tierName} (USD ${monthlyPriceUsd}/mes) en mi tienda.`,
  );
}

export function nexusModuleRequestUrl(
  tierName: string,
  moduleName: string,
): string {
  return buildWhatsAppUrl(
    getNexusSalesWhatsAppPhone(),
    `Hola, quiero el plan ${tierName} para activar el módulo ${moduleName}.`,
  );
}

export function nexusStorefrontLeadUrl(locale: "es" | "it" = "es"): string {
  const message =
    locale === "it"
      ? "Ciao, ho visto un negozio fatto con Nexus e vorrei aprire il mio e-commerce."
      : "Hola, vi una tienda hecha con Nexus y quiero levantar la mía.";
  return buildWhatsAppUrl(getNexusSalesWhatsAppPhone(), message);
}
