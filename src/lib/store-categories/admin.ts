import { slugify } from "@/lib/utils";
import type { StoreCategoryListItem } from "@/lib/store-categories/types";

export function normalizeCategorySlug(value: string) {
  return slugify(value.trim());
}

export function parseAudiencesField(raw: FormDataEntryValue | null): string[] | null {
  if (raw == null || raw === "") return null;
  const text = String(raw).trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed)) {
      const audiences = parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
      return audiences.length > 0 ? audiences : null;
    }
  } catch {
    // comma-separated fallback
  }

  const audiences = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return audiences.length > 0 ? audiences : null;
}

export function serializeStoreCategory(category: StoreCategoryListItem) {
  return {
    id: category.id,
    storeId: category.storeId,
    slug: category.slug,
    label: category.label,
    sortOrder: category.sortOrder,
    audiences: category.audiences,
    showInNav: category.showInNav,
  };
}

export type SerializedStoreCategory = ReturnType<typeof serializeStoreCategory>;
