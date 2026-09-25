"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { catalogHref } from "@/lib/storefront-paths";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCatalogNavigation } from "@/components/storefront/use-catalog-navigation";
import { cn } from "@/lib/utils";
import { getStorefrontCopy } from "@/lib/storefront-copy";

type ProductSearchProps = {
  className?: string;
  /** Barra compacta en el header (ícono en mobile, input en desktop) */
  compact?: boolean;
  id?: string;
};

export function ProductSearch({
  className,
  compact = false,
  id = "product-search",
}: ProductSearchProps) {
  const searchParams = useSearchParams();
  const navigateCatalog = useCatalogNavigation();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qFromUrl = searchParams.get("q") ?? "";
  const [prevQFromUrl, setPrevQFromUrl] = useState(qFromUrl);
  const copy = getStorefrontCopy();

  if (qFromUrl !== prevQFromUrl) {
    setPrevQFromUrl(qFromUrl);
    setQuery(qFromUrl);
  }

  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus();
  }, [mobileOpen]);

  const navigate = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    navigateCatalog(qs ? catalogHref(qs) : catalogHref());
    setMobileOpen(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(query);
  };

  const clear = () => {
    setQuery("");
    navigate("");
  };

  if (compact) {
    return (
      <div className={cn("flex min-w-0 items-center md:flex-1 xl:w-52 xl:flex-none", className)}>
        <form
          onSubmit={submit}
          className="relative hidden min-w-0 flex-1 items-center md:flex"
          role="search"
        >
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder={copy.searchProducts}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full pl-9 pr-8"
            aria-label={copy.searchProducts}
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
              aria-label={copy.clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <button
          type="button"
          aria-label={copy.searchProducts}
          aria-expanded={mobileOpen}
          className="shrink-0 rounded-lg p-2.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Search className="h-5 w-5" />
        </button>

        {mobileOpen && (
          <form
            onSubmit={submit}
            className="absolute inset-x-0 top-full z-50 border-b border-neutral-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md md:hidden"
            role="search"
          >
            <div className="relative mx-auto flex max-w-7xl items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  ref={inputRef}
                  type="search"
                  placeholder={copy.searchProducts}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 pl-9 pr-8"
                  aria-label={copy.searchProducts}
                />
                {query && (
                  <button
                    type="button"
                    onClick={clear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
                    aria-label={copy.clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="shrink-0 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
                aria-label={copy.closeSearch}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={className} role="search">
      <Label htmlFor={id} className="mb-2 block">
        {copy.search}
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          id={id}
          type="search"
          placeholder={copy.searchDescription}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
            aria-label={copy.clearSearch}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
