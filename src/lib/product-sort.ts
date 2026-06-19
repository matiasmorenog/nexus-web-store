export const PRODUCT_SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
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
  name: string;
  createdAt: Date;
  variants: { price: unknown }[];
};

function displayPrice(product: ProductWithDisplayVariant) {
  const price = product.variants[0]?.price;
  return price != null ? Number(price) : Number.POSITIVE_INFINITY;
}

export function sortProducts<T extends ProductWithDisplayVariant>(
  products: T[],
  sort: ProductSort,
): T[] {
  if (sort === "recientes") return products;

  const sorted = [...products];

  if (sort === "nombre-asc") {
    return sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  if (sort === "precio-asc") {
    return sorted.sort((a, b) => displayPrice(a) - displayPrice(b));
  }

  return sorted.sort((a, b) => displayPrice(b) - displayPrice(a));
}
