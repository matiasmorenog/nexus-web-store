export const BRAND_SUFFIX = "Indumentaria";

const SUFFIX_PATTERN = new RegExp(`\\s+${BRAND_SUFFIX}$`, "i");

/** Extrae el prefijo de marca (ej. "Alaska" desde "Alaska Indumentaria" o "Alaska"). */
export function getBrandPrefix(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.replace(SUFFIX_PATTERN, "").trim();
}

/** Nombre completo para mostrar en el sitio: "{prefijo} Indumentaria". */
export function formatStoreName(nameOrPrefix: string): string {
  const prefix = getBrandPrefix(nameOrPrefix);
  if (!prefix) return BRAND_SUFFIX;
  return `${prefix} ${BRAND_SUFFIX}`;
}

/** Normaliza el valor del input de configuración (solo prefijo, sin sufijo). */
export function normalizeBrandPrefix(input: string): string {
  return getBrandPrefix(input);
}

export function applyStoreName(text: string, storeName: string): string {
  return text.replace(/\{\{storeName\}\}/g, storeName);
}
