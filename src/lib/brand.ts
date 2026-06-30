import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import type { StoreVertical } from "@/lib/store-verticals/types";

const BRAND_SUFFIX_BY_VERTICAL: Record<StoreVertical, string> = {
  apparel: apparelConfig.brandSuffix,
  vape: vapeConfig.brandSuffix,
};

function resolveVertical(): StoreVertical {
  const value = process.env.STORE_VERTICAL ?? process.env.NEXT_PUBLIC_STORE_VERTICAL;
  return value === "vape" ? "vape" : "apparel";
}

export function getBrandSuffix(): string {
  return BRAND_SUFFIX_BY_VERTICAL[resolveVertical()];
}

/** @deprecated Usar getBrandSuffix(); se mantiene para imports legacy. */
export const BRAND_SUFFIX = "Indumentaria";

function suffixPattern(suffix: string) {
  if (!suffix) return null;
  return new RegExp(`\\s+${suffix}$`, "i");
}

/** Extrae el prefijo de marca (ej. "MiMarca" desde "MiMarca Indumentaria"). */
export function getBrandPrefix(name: string, suffix = getBrandSuffix()): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const pattern = suffixPattern(suffix);
  if (!pattern) return trimmed;
  return trimmed.replace(pattern, "").trim();
}

/** Nombre completo para mostrar en el sitio. */
export function formatStoreName(nameOrPrefix: string, suffix = getBrandSuffix()): string {
  const prefix = getBrandPrefix(nameOrPrefix, suffix);
  if (!prefix) return suffix || nameOrPrefix.trim();
  if (!suffix) return prefix;
  return `${prefix} ${suffix}`;
}

/** Normaliza el valor del input de configuración (solo prefijo, sin sufijo). */
export function normalizeBrandPrefix(input: string): string {
  return getBrandPrefix(input);
}

export function applyStoreName(text: string, storeName: string): string {
  return text.replace(/\{\{storeName\}\}/g, storeName);
}
