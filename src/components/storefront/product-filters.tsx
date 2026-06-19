"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { categoriesForStoreFilter, STORE_AUDIENCES } from "@/lib/categories";
import type { CatalogFilterCounts } from "@/lib/catalog-query";
import { Label } from "@/components/ui/label";
import { ProductSearch } from "@/components/storefront/product-search";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL"];

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
};

export function ProductFilters({ counts }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`/productos?${params.toString()}`);
  };

  const activeGenero = searchParams.get("genero") ?? "";
  const activeCategory = searchParams.get("categoria") ?? "";

  const genderOptions = STORE_AUDIENCES.filter(
    (audience) => audience.slug !== "unisex",
  );

  const categoryOptions = categoriesForStoreFilter(activeGenero || undefined);

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

  const clearFilters = () => {
    router.push("/productos");
  };

  return (
    <aside className="space-y-6 rounded-xl border border-neutral-200/90 bg-white p-5 shadow-md ring-1 ring-neutral-900/[0.04] lg:sticky lg:top-24">
      <ProductSearch />

      <div>
        <Label className="mb-2 block text-neutral-700">Género</Label>
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

      <div>
        <Label className="mb-2 block text-neutral-700">Categoría</Label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update({ genero: activeGenero, categoria: "" })}
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
                  update({ genero: activeGenero, categoria: category.slug })
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

      <div>
        <Label className="mb-2 block text-neutral-700">Talle</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const isActive = searchParams.get("talle") === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  update({
                    genero: activeGenero,
                    categoria: activeCategory,
                    talle: isActive ? "" : size,
                  })
                }
                className={sizeButtonClass(isActive)}
              >
                <span>{size}</span>
                <FilterCount
                  count={counts.talle[size] ?? 0}
                  active={isActive}
                  compact
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="precio-max" className="mb-2 block text-neutral-700">
          Precio máximo
        </Label>
        <select
          id="precio-max"
          className={fieldClass}
          value={searchParams.get("precioMax") ?? ""}
          onChange={(e) =>
            update({
              genero: activeGenero,
              categoria: activeCategory,
              precioMax: e.target.value,
            })
          }
        >
          <option value="">Sin límite</option>
          <option value="20000">Hasta $20.000</option>
          <option value="35000">Hasta $35.000</option>
          <option value="50000">Hasta $50.000</option>
        </select>
      </div>

      {(activeGenero ||
        activeCategory ||
        searchParams.get("talle") ||
        searchParams.get("precioMax")) && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-[var(--brand-primary)] hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}
