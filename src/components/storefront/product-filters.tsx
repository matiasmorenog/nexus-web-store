"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STORE_CATEGORIES } from "@/lib/categories";
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

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/productos?${params.toString()}`);
  };

  const activeCategory = searchParams.get("categoria") ?? "";

  return (
    <aside className="space-y-6 rounded-xl border border-neutral-200/80 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <ProductSearch />

      <div>
        <Label className="mb-2 block text-neutral-700">Categoría</Label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update("categoria", "")}
            className={filterButtonClass(!activeCategory)}
          >
            Todas
          </button>
          {STORE_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => update("categoria", cat.slug)}
              className={filterButtonClass(activeCategory === cat.slug)}
            >
              {cat.label}
            </button>
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
                update("talle", searchParams.get("talle") === size ? "" : size)
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
          onChange={(e) => update("precioMax", e.target.value)}
        >
          <option value="">Sin límite</option>
          <option value="20000">Hasta $20.000</option>
          <option value="35000">Hasta $35.000</option>
          <option value="50000">Hasta $50.000</option>
        </select>
      </div>
    </aside>
  );
}
