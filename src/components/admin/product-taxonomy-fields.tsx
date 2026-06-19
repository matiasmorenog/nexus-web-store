"use client";

import { useMemo, useState } from "react";
import {
  categoriesForAudience,
  STORE_AUDIENCES,
  type StoreAudience,
} from "@/lib/categories";
import { adminSelectClass } from "@/components/admin/admin-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProductTaxonomyFieldsProps = {
  defaultAudience?: string;
  defaultCategory?: string;
};

export function ProductTaxonomyFields({
  defaultAudience = "unisex",
  defaultCategory,
}: ProductTaxonomyFieldsProps) {
  const [audience, setAudience] = useState<StoreAudience>(
    (STORE_AUDIENCES.some((item) => item.slug === defaultAudience)
      ? defaultAudience
      : "unisex") as StoreAudience,
  );

  const categoryOptions = useMemo(
    () => categoriesForAudience(audience),
    [audience],
  );

  const resolvedCategory = categoryOptions.some(
    (category) => category.slug === defaultCategory,
  )
    ? defaultCategory
    : categoryOptions[0]?.slug;

  return (
    <>
      <div>
        <Label htmlFor="audience">Género</Label>
        <select
          id="audience"
          name="audience"
          className={cn(adminSelectClass, "mt-1.5")}
          value={audience}
          onChange={(event) =>
            setAudience(event.target.value as StoreAudience)
          }
          required
        >
          {STORE_AUDIENCES.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
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
              {category.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
