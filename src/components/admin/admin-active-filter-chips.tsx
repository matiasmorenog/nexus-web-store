"use client";

import { X } from "lucide-react";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import type { AdminFilterChip } from "@/lib/admin-product-filters";
import { cn } from "@/lib/utils";

type AdminActiveFilterChipsProps = {
  basePath: string;
  chips: AdminFilterChip[];
  clearParams: readonly string[];
  className?: string;
};

export function AdminActiveFilterChips({
  basePath,
  chips,
  clearParams,
  className,
}: AdminActiveFilterChipsProps) {
  const navigateCatalog = useAdminListNavigation();

  if (chips.length === 0) return null;

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString();
    navigateCatalog(query ? `${basePath}?${query}` : basePath);
  };

  const removeChip = (chip: AdminFilterChip) => {
    const params = new URLSearchParams(window.location.search);

    for (const param of chip.removeParams) {
      params.delete(param);
    }

    if (chip.setOnRemove) {
      for (const [key, value] of Object.entries(chip.setOnRemove)) {
        params.set(key, value);
      }
    }

    pushParams(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(window.location.search);

    for (const param of clearParams) {
      params.delete(param);
    }

    pushParams(params);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeChip(chip)}
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
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
        >
          Limpiar filtros
        </button>
      ) : null}
    </div>
  );
}
