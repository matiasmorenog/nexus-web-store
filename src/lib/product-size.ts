/** Sentinel stored on ProductVariant.size when Product.hasSize is false. */
export const SIZELESS_SIZE_VALUE = "-";

export function resolveVariantSize(
  hasSize: boolean,
  raw: string | null | undefined,
  fallback = "M",
): string {
  if (!hasSize) return SIZELESS_SIZE_VALUE;
  const trimmed = raw?.trim();
  return trimmed || fallback;
}

export function distinctSizes(sizes: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const size of sizes) {
    const key = size.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(size);
  }
  return out;
}
