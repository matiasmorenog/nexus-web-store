"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCT_SORT_OPTIONS, parseProductSort } from "@/lib/product-sort";
import { cn } from "@/lib/utils";

const fieldClass =
  "rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

type ProductSortSelectProps = {
  className?: string;
};

export function ProductSortSelect({ className }: ProductSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSort = parseProductSort(searchParams.get("orden") ?? undefined);

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "recientes") {
      params.delete("orden");
    } else {
      params.set("orden", value);
    }

    router.push(`/productos?${params.toString()}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="product-sort" className="text-sm text-neutral-500">
        Ordenar
      </label>
      <select
        id="product-sort"
        className={fieldClass}
        value={activeSort}
        onChange={(event) => handleChange(event.target.value)}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
