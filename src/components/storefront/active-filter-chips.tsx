"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  CATALOG_FILTER_PARAMS,
  type CatalogFilterChip,
} from "@/lib/catalog-filters";
import { cn } from "@/lib/utils";

type ActiveFilterChipsProps = {
  chips: CatalogFilterChip[];
  className?: string;
};

export function ActiveFilterChips({ chips, className }: ActiveFilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (chips.length === 0) return null;

  const removeParam = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    const query = params.toString();
    router.push(query ? `/productos?${query}` : "/productos");
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const param of CATALOG_FILTER_PARAMS) {
      params.delete(param);
    }
    const query = params.toString();
    router.push(query ? `/productos?${query}` : "/productos");
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <button
          key={chip.param}
          type="button"
          onClick={() => removeParam(chip.param)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-[var(--brand-primary)]/25",
            "bg-[var(--brand-primary-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)]",
            "transition-colors hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-primary)]/15",
          )}
          aria-label={`Quitar filtro ${chip.label}`}
        >
          <span>{chip.label}</span>
          <X className="size-3.5 shrink-0 opacity-70" aria-hidden />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
