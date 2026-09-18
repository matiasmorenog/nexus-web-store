import type { ProductCategoryDef } from "@/lib/store-verticals/types";

export type StoreCategoryRow = {
  id: string;
  storeId: string;
  slug: string;
  label: string;
  sortOrder: number;
  audiences: string[] | null;
  showInNav: boolean;
};

export type StoreCategoryListItem = StoreCategoryRow;

export function toProductCategoryDef(
  category: Pick<StoreCategoryRow, "slug" | "label" | "audiences">,
): ProductCategoryDef {
  return {
    slug: category.slug,
    label: category.label,
    ...(category.audiences ? { audiences: category.audiences } : {}),
  };
}
