import { sortProducts, type ProductSort } from "@/lib/product-sort";

export const ADMIN_PRODUCT_SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "nombre-asc", label: "Nombre A–Z" },
  { value: "nombre-desc", label: "Nombre Z–A" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "categoria", label: "Categoría" },
  { value: "variantes-desc", label: "Más variantes" },
] as const;

export type AdminProductSort = (typeof ADMIN_PRODUCT_SORT_OPTIONS)[number]["value"];

const VALID_SORTS = new Set<string>(
  ADMIN_PRODUCT_SORT_OPTIONS.map((option) => option.value),
);

const PRICE_SORTS = new Set<AdminProductSort>(["precio-asc", "precio-desc"]);

export function parseAdminProductSort(value: string | undefined): AdminProductSort {
  if (value && VALID_SORTS.has(value)) {
    return value as AdminProductSort;
  }
  return "recientes";
}

export function adminProductSortUsesInMemory(orden: AdminProductSort) {
  return PRICE_SORTS.has(orden);
}

type SortableProduct = {
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  variants: { price: unknown; stock?: number }[];
  _count?: { variants: number };
};

export function sortAdminProducts<T extends SortableProduct>(
  products: T[],
  orden: AdminProductSort,
): T[] {
  if (orden === "recientes") return products;

  if (orden === "precio-asc" || orden === "precio-desc" || orden === "nombre-asc") {
    return sortProducts(products, orden as ProductSort);
  }

  const sorted = [...products];

  if (orden === "nombre-desc") {
    return sorted.sort((a, b) => b.name.localeCompare(a.name, "es"));
  }

  if (orden === "categoria") {
    return sorted.sort((a, b) => {
      const byCategory = a.category.localeCompare(b.category, "es");
      if (byCategory !== 0) return byCategory;
      return a.name.localeCompare(b.name, "es");
    });
  }

  if (orden === "variantes-desc") {
    return sorted.sort(
      (a, b) =>
        (b._count?.variants ?? b.variants.length) -
        (a._count?.variants ?? a.variants.length),
    );
  }

  return sorted;
}

export function getAdminProductPrismaOrderBy(
  orden: AdminProductSort,
): { createdAt: "desc" } | { name: "asc" } | { name: "desc" } | { category: "asc" } | { variants: { _count: "desc" } } {
  switch (orden) {
    case "nombre-asc":
      return { name: "asc" };
    case "nombre-desc":
      return { name: "desc" };
    case "categoria":
      return { category: "asc" };
    case "variantes-desc":
      return { variants: { _count: "desc" } };
    case "recientes":
    default:
      return { createdAt: "desc" };
  }
}
