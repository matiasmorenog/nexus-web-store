import type { ProductCategoryDef } from "@/lib/store-verticals/types";

export function getCategoryLabelFromList(
  categories: readonly ProductCategoryDef[],
  slug: string,
) {
  return categories.find((category) => category.slug === slug)?.label ?? slug;
}

export function categoriesForAudienceFilter(
  categories: readonly ProductCategoryDef[],
  audience: string,
) {
  return categories.filter(
    (category) =>
      !category.audiences ||
      (category.audiences as readonly string[]).includes(audience),
  );
}

export function categoriesForStoreFilter(
  categories: readonly ProductCategoryDef[],
  genero?: string,
) {
  if (!genero) return categories;
  return categories.filter((category) =>
    (category.audiences as readonly string[] | undefined)?.includes(genero),
  );
}

export function audiencesForProductFilter(genero: string | undefined) {
  if (genero === "mujer") return ["mujer", "unisex"];
  if (genero === "hombre") return ["hombre", "unisex"];
  return undefined;
}

export function getProductTaxonomyLabel(
  categories: readonly ProductCategoryDef[],
  audiences: readonly { slug: string; label: string }[],
  category: string,
  audience: string,
) {
  const categoryLabel = getCategoryLabelFromList(categories, category);
  if (audience === "unisex") return categoryLabel;
  const audienceLabel =
    audiences.find((item) => item.slug === audience)?.label ?? audience;
  return `${categoryLabel} · ${audienceLabel}`;
}
