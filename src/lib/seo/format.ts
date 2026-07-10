const MAX_META_DESCRIPTION = 320;
const MAX_OG_IMAGE_URL = 2048;

export function normalizeMetaDescription(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_META_DESCRIPTION);
}

export function normalizeOgImageUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_OG_IMAGE_URL);
}

export function isValidOgImageUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function truncateMetaDescription(value: string, maxLength = 160): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
