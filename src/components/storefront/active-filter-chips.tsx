"use client";

import { useSearchParams } from "next/navigation";
import { catalogHref } from "@/lib/storefront-paths";
import { X } from "lucide-react";
import {
  CATALOG_FILTER_PARAMS,
  type CatalogFilterChip,
} from "@/lib/catalog-filters";
import { useCatalogNavigation } from "@/components/storefront/use-catalog-navigation";
import { cn } from "@/lib/utils";

type ActiveFilterChipsProps = {
  chips: CatalogFilterChip[];
  className?: string;
};

export function ActiveFilterChips({ chips, className }: ActiveFilterChipsProps) {
  const searchParams = useSearchParams();
  const navigateCatalog = useCatalogNavigation();

  if (chips.length === 0) return null;

  const removeParam = (param: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(param);
    const query = params.toString();
    navigateCatalog(query ? catalogHref(query) : catalogHref());
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const param of CATALOG_FILTER_PARAMS) {
      params.delete(param);
    }
    const query = params.toString();
    navigateCatalog(query ? catalogHref(query) : catalogHref());
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <button
          key={chip.param}
          type="button"
          onClick={() => removeParam(chip.param)}
          className={cn(
            // Mid pink: softer than --brand-primary-soft, stronger than old hover /15.
            "inline-flex items-center gap-1 rounded-full border border-[var(--brand-primary)]/20",
            "bg-[color-mix(in_srgb,var(--brand-primary)_8%,white)] px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)]/90",
            "transition-colors hover:border-[var(--brand-primary)]/30 hover:bg-[color-mix(in_srgb,var(--brand-primary)_12%,white)]",
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
