"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductsFiltersPanel } from "@/components/admin/products-filters-panel";
import { Button } from "@/components/ui/button";
import { useExitPresence } from "@/hooks/use-exit-presence";
import {
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";
import { cn } from "@/lib/utils";

/** Keep in sync with `.catalog-filter-drawer-*-exit` in globals.css */
const ADMIN_FILTER_DRAWER_EXIT_MS = 320;

type AdminProductsFilterDrawerProps = {
  totalProducts: number;
  categoryCounts: Record<string, number>;
  audienceCounts: Record<string, number>;
  estadoCounts: {
    destacado: number;
    promo2x1: number;
    normal: number;
    desactivado: number;
  };
  categories?: readonly ProductCategoryDef[];
  activeCount: number;
};

export function AdminProductsFilterDrawer({
  totalProducts,
  categoryCounts,
  audienceCounts,
  estadoCounts,
  categories,
  activeCount,
}: AdminProductsFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const { present, exiting, animKey } = useExitPresence(
    open,
    ADMIN_FILTER_DRAWER_EXIT_MS,
  );
  const copy = getAdminProductsCopy(readAdminLocaleFromDocument());

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", closeOnDesktop);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 lg:hidden"
        aria-expanded={open}
        aria-controls="admin-products-filter-drawer"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {copy.filtersTitle}
        {activeCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm bg-[var(--brand-primary)] px-1 text-xs text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {present ? (
        <div className="fixed inset-0 z-50 lg:hidden" key={animKey}>
          <button
            type="button"
            aria-label={copy.closeFilters}
            className={cn(
              "absolute inset-0 bg-neutral-900/40",
              exiting
                ? "catalog-filter-drawer-backdrop-exit pointer-events-none"
                : "catalog-filter-drawer-backdrop-enter",
            )}
            onClick={() => setOpen(false)}
            tabIndex={exiting ? -1 : undefined}
          />
          <aside
            id="admin-products-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={copy.filtersTitle}
            className={cn(
              "absolute top-0 right-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl",
              exiting
                ? "catalog-filter-drawer-panel-exit"
                : "catalog-filter-drawer-panel-enter",
            )}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3">
              <h2 className="text-base font-semibold">{copy.filtersTitle}</h2>
              <button
                type="button"
                aria-label={copy.closeFilters}
                className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                onClick={() => setOpen(false)}
                disabled={exiting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProductsFiltersPanel
                totalProducts={totalProducts}
                categoryCounts={categoryCounts}
                audienceCounts={audienceCounts}
                estadoCounts={estadoCounts}
                categories={categories}
                chrome={false}
              />
            </div>
            <div className="shrink-0 border-t border-neutral-200 p-4">
              <Button
                type="button"
                className="w-full"
                onClick={() => setOpen(false)}
                disabled={exiting}
              >
                {copy.applyFilters}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
