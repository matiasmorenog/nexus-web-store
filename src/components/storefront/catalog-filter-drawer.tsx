"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductFilters } from "@/components/storefront/product-filters";
import { Button } from "@/components/ui/button";
import type { CatalogFilterCounts } from "@/lib/catalog-index";
import type { CatalogPriceTier } from "@/lib/store-verticals/catalog-facets";
import type { ProductCategoryDef, StoreVertical } from "@/lib/store-verticals/types";
import { getStorefrontCopy } from "@/lib/storefront-copy";
import { cn } from "@/lib/utils";

type CatalogFilterDrawerProps = {
  counts: CatalogFilterCounts;
  activeCount: number;
  resultCount: number;
  showAudienceFilter: boolean;
  showPromo2x1: boolean;
  catalogVertical: StoreVertical;
  variantSizeOptions: string[];
  variantSizeParam: "talle" | "nicotina";
  variantSizeLabel: string;
  variantColorLabel?: string;
  priceTiers: readonly CatalogPriceTier[];
  categories: readonly ProductCategoryDef[];
};

export function CatalogFilterDrawer(props: CatalogFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const copy = getStorefrontCopy();
  const isApp2 = props.catalogVertical === "app2";

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
        className={cn(
          "inline-flex h-10 items-center gap-2 border px-3 text-sm font-medium lg:hidden",
          isApp2
            ? "border-app2 bg-app2-card text-[var(--brand-primary-light)]"
            : "border-neutral-200 bg-white text-neutral-800",
        )}
        aria-expanded={open}
        aria-controls="catalog-filter-drawer"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {copy.filter}
        {props.activeCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center bg-[var(--brand-primary)] px-1 text-xs text-white">
            {props.activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={copy.closeFilters}
            className="absolute inset-0 bg-neutral-900/40"
            onClick={() => setOpen(false)}
          />
          <aside
            id="catalog-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={copy.filter}
            className={cn(
              "absolute top-0 right-0 flex h-full w-full max-w-sm flex-col shadow-2xl",
              isApp2 ? "bg-app2-card text-[var(--brand-primary-light)]" : "bg-white",
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center justify-between border-b px-4 py-3",
                isApp2 ? "border-app2" : "border-neutral-200",
              )}
            >
              <h2 className="text-base font-semibold">{copy.filter}</h2>
              <button
                type="button"
                aria-label={copy.closeFilters}
                className="rounded p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <ProductFilters
                counts={props.counts}
                showAudienceFilter={props.showAudienceFilter}
                showPromo2x1={props.showPromo2x1}
                showProductSearch={false}
                catalogVertical={props.catalogVertical}
                variantSizeOptions={props.variantSizeOptions}
                variantSizeParam={props.variantSizeParam}
                variantSizeLabel={props.variantSizeLabel}
                variantColorLabel={props.variantColorLabel}
                priceTiers={props.priceTiers}
                categories={props.categories}
                chrome={false}
                idPrefix="drawer-"
              />
            </div>
            <div
              className={cn(
                "shrink-0 border-t p-4",
                isApp2 ? "border-app2" : "border-neutral-200",
              )}
            >
              <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                {copy.viewFilteredProducts(props.resultCount)}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
