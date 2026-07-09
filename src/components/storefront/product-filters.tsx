"use client";

import { useSearchParams } from "next/navigation";
import { categoriesForStoreFilter, STORE_AUDIENCES } from "@/lib/categories";
import type { CatalogFilterCounts } from "@/lib/catalog-index";
import type { CatalogPriceTier } from "@/lib/store-verticals/catalog-facets";
import { Label } from "@/components/ui/label";
import { ProductSearch } from "@/components/storefront/product-search";
import { useCatalogNavigation } from "@/components/storefront/use-catalog-navigation";
import { cn } from "@/lib/utils";

const APP1_SIZES = ["XS", "S", "M", "L", "XL"];

const fieldClass =
  "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

function filterButtonClass(active: boolean) {
  return cn(
    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
    active
      ? "bg-[var(--brand-primary)] text-white"
      : "text-neutral-700 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]",
  );
}

function sizeButtonClass(active: boolean) {
  return cn(
    "flex min-w-[2.5rem] flex-col items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
    active
      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
      : "border-neutral-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
  );
}

function FilterCount({
  count,
  active,
  compact = false,
}: {
  count: number;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "shrink-0 tabular-nums",
        compact ? "text-[10px] leading-none" : "text-xs",
        active ? "text-white/75" : "text-neutral-400",
      )}
    >
      {count}
    </span>
  );
}

type ProductFiltersProps = {
  counts: CatalogFilterCounts;
  showAudienceFilter: boolean;
  showPromo2x1: boolean;
  showProductSearch: boolean;
  catalogVertical: "app1" | "app2";
  variantSizeOptions: string[];
  variantSizeParam: "talle" | "nicotina";
  variantSizeLabel: string;
  variantColorLabel?: string;
  priceTiers: readonly CatalogPriceTier[];
};

export function ProductFilters({
  counts,
  showAudienceFilter,
  showPromo2x1,
  showProductSearch,
  catalogVertical,
  variantSizeOptions,
  variantSizeParam,
  variantSizeLabel,
  variantColorLabel,
  priceTiers,
}: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const navigateCatalog = useCatalogNavigation();
  const isApp2 = catalogVertical === "app2";
  const sizeParam = variantSizeParam;
  const sizeCounts = isApp2 ? counts.nicotina : counts.talle;
  const sizeOptions = isApp2 ? variantSizeOptions : APP1_SIZES;
  const sizeLabel = variantSizeLabel;

  const update = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    navigateCatalog(`/productos?${params.toString()}`);
  };

  const activeGenero = searchParams.get("genero") ?? "";
  const activeCategory = searchParams.get("categoria") ?? "";
  const activeDestacados = searchParams.get("destacados") === "1";
  const activePromo2x1 = searchParams.get("promo") === "2x1";
  const activeSize = searchParams.get(sizeParam) ?? "";
  const activeSabor = searchParams.get("sabor") ?? "";

  const hasActiveFilters = Boolean(
    activeGenero ||
      activeCategory ||
      activeDestacados ||
      (showPromo2x1 && activePromo2x1) ||
      activeSize ||
      activeSabor ||
      searchParams.get("precioMax") ||
      searchParams.get("q")?.trim(),
  );

  const genderOptions = STORE_AUDIENCES.filter(
    (audience) => audience.slug !== "unisex",
  );

  const categoryOptions = categoriesForStoreFilter(
    showAudienceFilter ? activeGenero || undefined : undefined,
  );

  const selectGenero = (genero: string) => {
    const nextCategories = categoriesForStoreFilter(genero || undefined);
    const keepCategory = nextCategories.some(
      (category) => category.slug === activeCategory,
    );

    update({
      genero,
      categoria: keepCategory ? activeCategory : "",
    });
  };

  const baseFilterParams = () => ({
    ...(showAudienceFilter ? { genero: activeGenero } : {}),
    categoria: activeCategory,
  });

  const saborOptions = Object.keys(counts.sabor);

  const asideClass = cn(
    "h-fit w-full self-start space-y-6 rounded-xl border p-5 shadow-md lg:sticky lg:top-[calc(var(--storefront-chrome-height,6rem)+1rem)] lg:max-h-[calc(100dvh-var(--storefront-chrome-height,6rem)-2.5rem)] lg:overflow-y-auto lg:overscroll-contain",
    isApp2
      ? "border-app2 bg-app2-card"
      : "border-neutral-200/90 bg-white ring-1 ring-neutral-900/[0.04]",
  );

  const labelClass = cn("mb-2 block", isApp2 ? "text-app2-muted" : "text-neutral-700");

  return (
    <aside className={asideClass}>
      {showProductSearch ? <ProductSearch /> : null}

      <div>
        <Label className={labelClass}>Promoción</Label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update({ destacados: activeDestacados ? "" : "1" })}
            className={filterButtonClass(activeDestacados)}
          >
            <span>Destacados</span>
            <FilterCount count={counts.destacados} active={activeDestacados} />
          </button>
          {showPromo2x1 ? (
            <button
              type="button"
              onClick={() => update({ promo: activePromo2x1 ? "" : "2x1" })}
              className={filterButtonClass(activePromo2x1)}
            >
              <span>2x1</span>
              <FilterCount count={counts.promo2x1} active={activePromo2x1} />
            </button>
          ) : null}
        </div>
      </div>

      {showAudienceFilter ? (
        <div>
          <Label className={labelClass}>Género</Label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => selectGenero("")}
              className={filterButtonClass(!activeGenero)}
            >
              <span>Todo</span>
              <FilterCount count={counts.genero.all} active={!activeGenero} />
            </button>
            {genderOptions.map((audience) => {
              const count =
                audience.slug === "mujer"
                  ? counts.genero.mujer
                  : counts.genero.hombre;
              const isActive = activeGenero === audience.slug;

              return (
                <button
                  key={audience.slug}
                  type="button"
                  onClick={() => selectGenero(audience.slug)}
                  className={filterButtonClass(isActive)}
                >
                  <span>{audience.label}</span>
                  <FilterCount count={count} active={isActive} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <Label className={labelClass}>Categoría</Label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update({ ...baseFilterParams(), categoria: "" })}
            className={filterButtonClass(!activeCategory)}
          >
            <span>Todas</span>
            <FilterCount count={counts.categoriaAll} active={!activeCategory} />
          </button>

          {categoryOptions.map((category) => {
            const isActive = activeCategory === category.slug;
            const count = counts.categoria[category.slug] ?? 0;

            return (
              <button
                key={category.slug}
                type="button"
                onClick={() =>
                  update({ ...baseFilterParams(), categoria: category.slug })
                }
                className={filterButtonClass(isActive)}
              >
                <span>{category.label}</span>
                <FilterCount count={count} active={isActive} />
              </button>
            );
          })}
        </div>
      </div>

      {sizeOptions.length > 0 ? (
        <div>
          <Label className={labelClass}>{sizeLabel}</Label>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const isActive = activeSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    update({
                      ...baseFilterParams(),
                      [sizeParam]: isActive ? "" : size,
                    })
                  }
                  className={sizeButtonClass(isActive)}
                >
                  <span>{size}</span>
                  <FilterCount
                    count={sizeCounts[size] ?? 0}
                    active={isActive}
                    compact
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isApp2 && variantColorLabel && saborOptions.length > 0 ? (
        <div>
          <Label className={labelClass}>{variantColorLabel}</Label>
          <div className="flex flex-wrap gap-2">
            {saborOptions.map((sabor) => {
              const isActive = activeSabor === sabor;

              return (
                <button
                  key={sabor}
                  type="button"
                  onClick={() =>
                    update({
                      ...baseFilterParams(),
                      sabor: isActive ? "" : sabor,
                    })
                  }
                  className={sizeButtonClass(isActive)}
                >
                  <span>{sabor}</span>
                  <FilterCount
                    count={counts.sabor[sabor] ?? 0}
                    active={isActive}
                    compact
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <Label htmlFor="precio-max" className={labelClass}>
          Precio máximo
        </Label>
        <select
          id="precio-max"
          className={fieldClass}
          value={searchParams.get("precioMax") ?? ""}
          onChange={(e) =>
            update({
              ...baseFilterParams(),
              precioMax: e.target.value,
            })
          }
        >
          <option value="">Sin límite</option>
          {priceTiers.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={() => navigateCatalog("/productos")}
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          Limpiar filtros
        </button>
      ) : null}
    </aside>
  );
}
