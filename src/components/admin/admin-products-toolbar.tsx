"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { Label } from "@/components/ui/label";
import { ADMIN_PRODUCT_SORT_OPTIONS } from "@/lib/admin-product-sort";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1";

export function AdminProductsToolbar({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const navigateCatalog = useAdminListNavigation();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  const activeSort = searchParams.get("orden") ?? "recientes";
  const qFromUrl = searchParams.get("q") ?? "";
  const [prevQFromUrl, setPrevQFromUrl] = useState(qFromUrl);

  if (qFromUrl !== prevQFromUrl) {
    setPrevQFromUrl(qFromUrl);
    setQuery(qFromUrl);
  }

  const navigate = (updates: { q?: string; orden?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.q !== undefined) {
      const trimmed = updates.q.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
    }

    if (updates.orden !== undefined) {
      if (updates.orden && updates.orden !== "recientes") {
        params.set("orden", updates.orden);
      } else {
        params.delete("orden");
      }
    }

    const qs = params.toString();
    navigateCatalog(qs ? `/admin/productos?${qs}` : "/admin/productos");
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <AdminSearchField
            value={query}
            onChange={setQuery}
            onClear={() => {
              setQuery("");
              navigate({ q: "" });
            }}
            onSubmit={() => navigate({ q: query })}
            placeholder="Buscar por nombre, slug, SKU..."
            ariaLabel="Buscar productos"
          />
        </div>

        <div className="w-full lg:w-52">
          <Label
            htmlFor="admin-product-sort-toolbar"
            className="mb-1.5 block text-sm text-neutral-600"
          >
            Ordenar
          </Label>
          <select
            id="admin-product-sort-toolbar"
            className={fieldClass}
            value={activeSort}
            onChange={(event) => navigate({ orden: event.target.value })}
          >
            {ADMIN_PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
