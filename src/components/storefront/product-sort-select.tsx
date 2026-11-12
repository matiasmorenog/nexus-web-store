"use client";

import { useSearchParams } from "next/navigation";
import { catalogHref } from "@/lib/storefront-paths";
import { PRODUCT_SORT_OPTIONS, parseProductSort } from "@/lib/product-sort";
import { useCatalogNavigation } from "@/components/storefront/use-catalog-navigation";
import { MenuSelect } from "@/components/ui/menu-select";
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
      <MenuSelect
        id="product-sort"
        className="w-auto min-w-[10rem]"
        aria-label={copy.sort}
        value={activeSort}
        onChange={handleChange}
        options={PRODUCT_SORT_OPTIONS.map((option) => ({
          value: option.value,
          label: labels[option.value],
        }))}
      />
    </div>
  );
}
