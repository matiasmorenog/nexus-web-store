export const STORE_CATEGORIES = [
  { slug: "tops", label: "Tops y remeras" },
  { slug: "leggings", label: "Leggings y calzas" },
  { slug: "shorts", label: "Shorts" },
  { slug: "hoodies", label: "Hoodies y buzos" },
  { slug: "accesorios", label: "Accesorios" },
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number]["slug"];

export function getCategoryLabel(slug: string) {
  return STORE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
