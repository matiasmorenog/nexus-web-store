import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { getStorefrontConfig } from "@/lib/store-verticals";

export function getBrandLogoAccent(): string {
  return getStorefrontConfig().brandLogoAccent ?? "";
}

export function getClientBrandLogoAccent(): string {
  return getClientStorefrontConfig().brandLogoAccent ?? "";
}

function logoAccentPattern(accent: string) {
  if (!accent) return null;
  const escaped = accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\s+${escaped}$`, "i");
}

/**
 * Parte principal de la marca para logo, admin y títulos cortos.
 * Si el storefront define `brandLogoAccent`, lo quita del final del nombre completo.
 */
export function getBrandPrefix(
  name: string,
  logoAccent = getBrandLogoAccent(),
): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const pattern = logoAccentPattern(logoAccent);
  if (!pattern) return trimmed;
  return trimmed.replace(pattern, "").trim() || trimmed;
}

/** Nombre completo de la tienda tal como está en la DB. */
export function formatStoreName(name: string): string {
  return name.trim();
}

export function applyStoreName(text: string, storeName: string): string {
  return text.replace(/\{\{storeName\}\}/g, storeName);
}
