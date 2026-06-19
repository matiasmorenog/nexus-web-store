"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  FILTER_GROUPS,
  getCategoryLabel,
  STORE_AUDIENCES,
} from "@/lib/categories";
import { Label } from "@/components/ui/label";
import { ProductSearch } from "@/components/storefront/product-search";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL"];

const fieldClass =
  "flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

function filterButtonClass(active: boolean) {
  return cn(
    "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
    active
      ? "bg-[var(--brand-primary)] text-white"
      : "text-neutral-700 hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)]",
  );
}

function sizeButtonClass(active: boolean) {
  return cn(
    "min-w-[2.5rem] rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
    active
      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
      : "border-neutral-200 bg-white hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
  );
}

export function ProductFilters() {
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

  const selectCategory = (genero: string, categoria: string) => {
    update({
      genero,
      categoria,
    });
  };

  const clearFilters = () => {
    router.push("/productos");
  };

  return (
    <aside className="space-y-6 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <ProductSearch />

      <div>
        <Label className="mb-2 block text-neutral-700">Género</Label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update({ genero: "", categoria: activeCategory })}
            className={filterButtonClass(!activeGenero)}
          >
            Todos
          </button>
          {STORE_AUDIENCES.filter((audience) => audience.slug !== "unisex").map(
            (audience) => (
              <button
                key={audience.slug}
                type="button"
                onClick={() =>
                  update({ genero: audience.slug, categoria: activeCategory })
                }
                className={filterButtonClass(activeGenero === audience.slug)}
              >
                {audience.label}
              </button>
            ),
          )}
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-neutral-700">Categoría</Label>
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => update({ genero: activeGenero, categoria: "" })}
            className={filterButtonClass(!activeCategory)}
          >
            Todas
          </button>

          {FILTER_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.categories.map((slug) => {
                  const isActive =
                    activeCategory === slug &&
                    (group.genero === null || activeGenero === group.genero);

                  return (
                    <button
                      key={`${group.genero ?? "all"}-${slug}`}
                      type="button"
                      onClick={() =>
                        selectCategory(group.genero ?? activeGenero, slug)
                      }
                      className={filterButtonClass(isActive)}
                    >
                      {getCategoryLabel(slug)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block text-neutral-700">Talle</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                update({
                  genero: activeGenero,
                  categoria: activeCategory,
                  talle: searchParams.get("talle") === size ? "" : size,
                })
              }
              className={sizeButtonClass(searchParams.get("talle") === size)}
            >
              {size}
            </button>
          ))}
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

      {(activeGenero || activeCategory || searchParams.get("talle") || searchParams.get("precioMax")) && (
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
