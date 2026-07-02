import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import type { StoreVertical } from "@/lib/store-verticals/types";

const BRAND_LOGO_ACCENT_BY_VERTICAL: Record<StoreVertical, string | undefined> = {
  apparel: apparelConfig.brandLogoAccent,
  vape: vapeConfig.brandLogoAccent,
};

function resolveVertical(): StoreVertical {
  const value = process.env.STORE_VERTICAL ?? process.env.NEXT_PUBLIC_STORE_VERTICAL;
  return value === "vape" ? "vape" : "apparel";
}

export function getBrandLogoAccent(): string {
  return BRAND_LOGO_ACCENT_BY_VERTICAL[resolveVertical()] ?? "";
}

function logoAccentPattern(accent: string) {
  if (!accent) return null;
  const escaped = accent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\s+${escaped}$`, "i");
}

/**
 * Parte principal de la marca para logo, admin y títulos cortos.
 * Si el vertical define `brandLogoAccent`, lo quita del final del nombre completo.
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
