"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { adminSurfaceClass } from "@/components/admin/admin-surface";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { Label } from "@/components/ui/label";
import { MenuSelect } from "@/components/ui/menu-select";
import {
  getAdminProductsCopy,
  readAdminLocaleFromDocument,
} from "@/lib/admin-locale";
import { getAdminProductSortOptions } from "@/lib/admin-product-sort";
import { cn } from "@/lib/utils";

export function AdminProductsToolbar({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const navigateCatalog = useAdminListNavigation();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const locale = readAdminLocaleFromDocument();
  const copy = getAdminProductsCopy(locale);
  const sortOptions = getAdminProductSortOptions(locale);

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
        adminSurfaceClass,
        "p-4",
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
            placeholder={copy.searchPlaceholder}
            ariaLabel={copy.searchAria}
            clearAriaLabel={copy.clearSearchAria}
          />
        </div>

        <div className="w-full lg:w-52">
          <Label
            htmlFor="admin-product-sort-toolbar"
            className="mb-1.5 block text-sm text-neutral-600"
          >
            {copy.sortLabel}
          </Label>
          <MenuSelect
            id="admin-product-sort-toolbar"
            aria-label={copy.sortLabel}
            value={activeSort}
            onChange={(orden) => navigate({ orden })}
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
}
