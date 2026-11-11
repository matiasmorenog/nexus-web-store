"use client";

import { useSearchParams } from "next/navigation";
import { catalogHref } from "@/lib/storefront-paths";
import { PRODUCT_SORT_OPTIONS, parseProductSort } from "@/lib/product-sort";
import { useCatalogNavigation } from "@/components/storefront/use-catalog-navigation";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";
import { getStorefrontCopy } from "@/lib/storefront-copy";

type ProductSortSelectProps = {
  className?: string;
};

export function ProductSortSelect({ className }: ProductSortSelectProps) {
  const searchParams = useSearchParams();
  const navigateCatalog = useCatalogNavigation();
  const activeSort = parseProductSort(searchParams.get("orden") ?? undefined);
  const copy = getStorefrontCopy();
  const labels: Record<(typeof PRODUCT_SORT_OPTIONS)[number]["value"], string> = {
    recientes: copy.newest,
    "precio-asc": copy.priceAsc,
    "precio-desc": copy.priceDesc,
    "nombre-asc": copy.nameAsc,
  };

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "recientes") {
      params.delete("orden");
    } else {
      params.set("orden", value);
    }

    navigateCatalog(catalogHref(params.toString()));
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="product-sort" className="shrink-0 text-sm text-neutral-500">
        {copy.sort}
      </label>
      <SelectField
        id="product-sort"
        wrapperClassName="w-auto min-w-[10rem]"
        className="h-9 rounded-lg border-neutral-200 py-1.5 text-neutral-700"
        value={activeSort}
        onChange={(event) => handleChange(event.target.value)}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {labels[option.value]}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
