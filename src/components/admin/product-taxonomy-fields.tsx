"use client";

import { useMemo, useState } from "react";
import { AdminSelect } from "@/components/admin/admin-form";
import { Label } from "@/components/ui/label";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import {
  categoriesForAudienceFilter,
  getCategoryLabelFromList,
} from "@/lib/store-verticals/taxonomy";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";

type ProductTaxonomyFieldsProps = {
  defaultAudience?: string;
  defaultCategory?: string;
};

export function ProductTaxonomyFields({
  defaultAudience = "unisex",
  defaultCategory,
}: ProductTaxonomyFieldsProps) {
  const verticalConfig = useMemo(() => getClientStorefrontConfig(), []);
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
          <AdminSelect
            id="audience"
            name="audience"
            wrapperClassName="mt-1.5"
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            required
          >
            {audiences.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </AdminSelect>
        </div>
      ) : (
        <input type="hidden" name="audience" value="unisex" />
      )}
      <div>
        <Label htmlFor="category">Categoría</Label>
        <AdminSelect
          id="category"
          name="category"
          wrapperClassName="mt-1.5"
          key={audience}
          defaultValue={resolvedCategory}
          required
        >
          {categoryOptions.map((category) => (
            <option key={category.slug} value={category.slug}>
              {getCategoryLabelFromList(productCategories, category.slug)}
            </option>
          ))}
        </AdminSelect>
      </div>
    </>
  );
}
