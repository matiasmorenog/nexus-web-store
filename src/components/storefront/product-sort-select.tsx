"use client";

import { useSearchParams } from "next/navigation";
import { catalogHref } from "@/lib/storefront-paths";
import { PRODUCT_SORT_OPTIONS, parseProductSort } from "@/lib/product-sort";
import { useCatalogNavigation } from "@/components/storefront/use-catalog-navigation";
import { cn } from "@/lib/utils";
import { getStorefrontCopy } from "@/lib/storefront-copy";

const fieldClass =
  "rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

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
      <label htmlFor="product-sort" className="text-sm text-neutral-500">
        {copy.sort}
      </label>
      <select
        id="product-sort"
        className={fieldClass}
        value={activeSort}
        onChange={(event) => handleChange(event.target.value)}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {labels[option.value]}
          </option>
        ))}
      </select>
    </div>
  );
}
