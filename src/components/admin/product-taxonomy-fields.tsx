"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { MenuSelect } from "@/components/ui/menu-select";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import {
  categoriesForAudienceFilter,
  getCategoryLabelFromList,
} from "@/lib/store-verticals/taxonomy";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";

type ProductTaxonomyFieldsProps = {
  defaultAudience?: string;
  defaultCategory?: string;
  /** Categorías de la tienda (DB). Si falta, usa vertical client config. */
  categories?: readonly ProductCategoryDef[];
};

export function ProductTaxonomyFields({
  defaultAudience = "unisex",
  defaultCategory,
  categories: categoriesProp,
}: ProductTaxonomyFieldsProps) {
  const verticalConfig = useMemo(() => getClientStorefrontConfig(), []);
  const { audiences, features } = verticalConfig;
  const productCategories = categoriesProp ?? verticalConfig.productCategories;

  const defaultAudienceSlug =
    audiences.find((item) => item.slug === defaultAudience)?.slug ??
    audiences[0]?.slug ??
    "unisex";

  const [audience, setAudience] = useState(defaultAudienceSlug);
  const [categoryOverride, setCategoryOverride] = useState<string | null>(
    defaultCategory ?? null,
  );

  const categoryOptions = useMemo(() => {
    if (!features.showAudienceFilter) {
      return productCategories;
    }
    return categoriesForAudienceFilter(
      productCategories as readonly ProductCategoryDef[],
      audience,
    );
  }, [audience, features.showAudienceFilter, productCategories]);

  const category =
    categoryOverride &&
    categoryOptions.some((item) => item.slug === categoryOverride)
      ? categoryOverride
      : (categoryOptions[0]?.slug ?? "");

  return (
    <>
      {features.showAudienceFilter ? (
        <div>
          <Label htmlFor="audience">Género</Label>
          <MenuSelect
            id="audience"
            name="audience"
            className="mt-1.5"
            aria-label="Género"
            value={audience}
            onChange={(next) => {
              setAudience(next);
              setCategoryOverride(null);
            }}
            required
            options={audiences.map((item) => ({
              value: item.slug,
              label: item.label,
            }))}
          />
        </div>
      ) : (
        <input type="hidden" name="audience" value="unisex" />
      )}
      <div>
        <Label htmlFor="category">Categoría</Label>
        <MenuSelect
          id="category"
          name="category"
          className="mt-1.5"
          aria-label="Categoría"
          value={category}
          onChange={setCategoryOverride}
          required
          options={categoryOptions.map((item) => ({
            value: item.slug,
            label: getCategoryLabelFromList(productCategories, item.slug),
          }))}
        />
      </div>
    </>
  );
}
