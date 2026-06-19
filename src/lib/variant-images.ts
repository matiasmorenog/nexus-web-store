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

type ProductCardVariant = {
  color: string;
  imageUrl: string;
  price: unknown;
  stock?: number;
};

export function partitionVariantsForCard(variants: ProductCardVariant[]) {
  const inStockVariants = variants.filter((variant) => (variant.stock ?? 0) > 0);

  return {
    inStock: inStockVariants.length > 0,
    displayVariants:
      inStockVariants.length > 0 ? inStockVariants : variants,
  };
}

export function getProductCardImages(variants: ProductCardVariant[]) {
  if (variants.length === 0) {
    return { imageUrl: "", hoverImageUrl: undefined, price: 0 };
  }

  const sorted = [...variants].sort(
    (a, b) => Number(a.price) - Number(b.price),
  );
  const primary = sorted[0];
  const colorImages = [...buildColorImageMap(variants).values()];
  const hoverImageUrl = colorImages.find(
    (url) => url && url !== primary.imageUrl,
  );

  return {
    imageUrl: primary.imageUrl,
    hoverImageUrl,
    price: Number(primary.price),
  };
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
