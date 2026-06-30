"use client";

import { useMemo, useState } from "react";
import { adminSelectClass } from "@/components/admin/admin-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apparelConfig } from "@/lib/store-verticals/apparel/config";
import { vapeConfig } from "@/lib/store-verticals/vape/config";
import {
  categoriesForAudienceFilter,
  getCategoryLabelFromList,
} from "@/lib/store-verticals/taxonomy";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";

function resolveVerticalConfig() {
  const vertical =
    process.env.NEXT_PUBLIC_STORE_VERTICAL ??
    process.env.STORE_VERTICAL ??
    "apparel";
  return vertical === "vape" ? vapeConfig : apparelConfig;
}

type ProductTaxonomyFieldsProps = {
  defaultAudience?: string;
  defaultCategory?: string;
};

export function ProductTaxonomyFields({
  defaultAudience = "unisex",
  defaultCategory,
}: ProductTaxonomyFieldsProps) {
  const verticalConfig = useMemo(() => resolveVerticalConfig(), []);
  const { audiences, productCategories, features } = verticalConfig;

  const defaultAudienceSlug =
    audiences.find((item) => item.slug === defaultAudience)?.slug ??
    audiences[0]?.slug ??
    "unisex";

  const [audience, setAudience] = useState(defaultAudienceSlug);

  const categoryOptions = useMemo(() => {
    if (!features.showAudienceFilter) {
      return productCategories;
    }
    return categoriesForAudienceFilter(
      productCategories as readonly ProductCategoryDef[],
      audience,
    );
  }, [audience, features.showAudienceFilter, productCategories]);

  const resolvedCategory = categoryOptions.some(
    (category) => category.slug === defaultCategory,
  )
    ? defaultCategory
    : categoryOptions[0]?.slug;

  return (
    <>
      {features.showAudienceFilter ? (
        <div>
          <Label htmlFor="audience">Género</Label>
          <select
            id="audience"
            name="audience"
            className={cn(adminSelectClass, "mt-1.5")}
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            required
          >
            {audiences.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="audience" value="unisex" />
      )}
      <div>
        <Label htmlFor="category">Categoría</Label>
        <select
          id="category"
          name="category"
          className={cn(adminSelectClass, "mt-1.5")}
          key={audience}
          defaultValue={resolvedCategory}
          required
        >
          {categoryOptions.map((category) => (
            <option key={category.slug} value={category.slug}>
              {getCategoryLabelFromList(productCategories, category.slug)}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
