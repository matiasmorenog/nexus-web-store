export const PRODUCT_SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre-asc", label: "Nombre A–Z" },
] as const;

export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

const VALID_SORTS = new Set<string>(PRODUCT_SORT_OPTIONS.map((option) => option.value));

export function parseProductSort(value: string | undefined): ProductSort {
  if (value && VALID_SORTS.has(value)) {
    return value as ProductSort;
  }
  return "recientes";
}

type ProductWithDisplayVariant = {
  id: string;
  name: string;
  createdAt: Date;
  variants: { price: unknown; stock?: number }[];
};

function displayPrice(product: ProductWithDisplayVariant) {
  const inStockVariants = product.variants.filter(
    (variant) => (variant.stock ?? 1) > 0,
  );
  const pool =
    inStockVariants.length > 0 ? inStockVariants : product.variants;
  const sorted = [...pool].sort(
    (a, b) => Number(a.price) - Number(b.price),
  );
  const price = sorted[0]?.price;
  return price != null ? Number(price) : Number.POSITIVE_INFINITY;
}

function salesCount(productId: string, salesTotals?: Map<string, number>) {
  return salesTotals?.get(productId) ?? 0;
}

export function sortProducts<T extends ProductWithDisplayVariant>(
  products: T[],
  sort: ProductSort,
  salesTotals?: Map<string, number>,
): T[] {
  if (sort === "recientes") return products;

  const sorted = [...products];

  if (sort === "mas-vendidos") {
    return sorted.sort((a, b) => {
      const bySales = salesCount(b.id, salesTotals) - salesCount(a.id, salesTotals);
      if (bySales !== 0) return bySales;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  if (sort === "nombre-asc") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  if (sort === "precio-asc") {
    return sorted.sort((a, b) => displayPrice(a) - displayPrice(b));
  }

  if (sort === "precio-desc") {
    return sorted.sort((a, b) => displayPrice(b) - displayPrice(a));
  }

  return sorted;
}
