import { db } from "@/lib/db";

export function normalizeVariantColor(color: string) {
  return color.trim().toLowerCase();
}

export function buildColorImageMap(
  variants: { color: string; imageUrl: string }[],
) {
  const map = new Map<string, string>();

  for (const variant of variants) {
    const key = normalizeVariantColor(variant.color);
    if (!map.has(key)) {
      map.set(key, variant.imageUrl);
    }
  }

  return map;
}

export function getUniqueProductColors(
  variants: { color: string }[],
): string[] {
  const seen = new Set<string>();
  const colors: string[] = [];

  for (const variant of variants) {
    const key = normalizeVariantColor(variant.color);
    if (!seen.has(key)) {
      seen.add(key);
      colors.push(variant.color);
    }
  }

  return colors.sort((a, b) => a.localeCompare(b, "es"));
}

export async function findProductColorImage(
  productId: string,
  color: string,
) {
  const variant = await db.productVariant.findFirst({
    where: {
      productId,
      color: { equals: color.trim(), mode: "insensitive" },
    },
    select: { imageUrl: true },
    orderBy: { createdAt: "asc" },
  });

  return variant?.imageUrl ?? null;
}

export async function syncProductColorImage(
  productId: string,
  color: string,
  imageUrl: string,
) {
  await db.productVariant.updateMany({
    where: {
      productId,
      color: { equals: color.trim(), mode: "insensitive" },
    },
    data: { imageUrl },
  });
}
