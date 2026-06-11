"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { STORE_CATEGORIES } from "@/lib/categories";
import { Label } from "@/components/ui/label";
import { ProductSearch } from "@/components/storefront/product-search";

const SIZES = ["XS", "S", "M", "L", "XL"];

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

  return (
    <aside className="space-y-6">
      <ProductSearch />

      <div>
        <Label className="mb-2 block">Categoría</Label>
        <div className="space-y-1">
          <button
            onClick={() => update("categoria", "")}
            className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
              !(searchParams.get("categoria") ?? "")
                ? "bg-[var(--brand-primary)] text-white"
                : "hover:bg-[var(--brand-primary-soft)]"
            }`}
          >
            Todas
          </button>
          {STORE_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => update("categoria", cat.slug)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm ${
                searchParams.get("categoria") === cat.slug
                  ? "bg-[var(--brand-primary)] text-white"
                  : "hover:bg-[var(--brand-primary-soft)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Talle</Label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() =>
                update("talle", searchParams.get("talle") === size ? "" : size)
              }
              className={`rounded-md border px-3 py-1 text-sm ${
                searchParams.get("talle") === size
                  ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                  : "border-neutral-300 hover:border-[var(--brand-primary)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Precio máximo</Label>
        <select
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
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
