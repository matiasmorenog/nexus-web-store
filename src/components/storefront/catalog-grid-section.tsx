"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderCatalogProductCard } from "@/themes/catalog-product-card";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonProductCard } from "@/components/storefront/storefront-skeleton";
import type { CatalogProductRow } from "@/lib/catalog-index";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-pagination";
import { cn } from "@/lib/utils";

type CatalogGridSectionProps = {
  products: CatalogProductRow[];
  catalogVertical?: "apparel" | "vape";
  initialPage: {
    products: CatalogProductRow[];
    total: number;
    hasMore: boolean;
  };
};

export function CatalogGridSection({
  products,
  catalogVertical = "apparel",
  initialPage,
}: CatalogGridSectionProps) {
  const [visibleCount, setVisibleCount] = useState(
    initialPage.products.length,
  );
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isVape = catalogVertical === "vape";

  useEffect(() => {
    setVisibleCount(initialPage.products.length);
    setLoading(false);
  }, [initialPage.products, products]);

  const hasMore = visibleCount < products.length;
  const visibleProducts = products.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setVisibleCount((current) =>
      Math.min(current + CATALOG_PAGE_SIZE, products.length),
    );
    setLoading(false);
  }, [hasMore, loading, products.length]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (products.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed px-6 py-16 text-center",
          isVape
            ? "border-vape bg-vape-card"
            : "border-neutral-200 bg-[var(--brand-primary-soft)]/40",
        )}
      >
        <p
          className={cn(
            "font-medium",
            isVape ? "text-[var(--brand-primary-light)]" : "text-neutral-900",
          )}
        >
          No se encontraron productos
        </p>
        <p className={cn("mt-2 text-sm", isVape ? "text-vape-muted" : "text-neutral-500")}>
          Probá con otros filtros o una búsqueda distinta.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
        {visibleProducts.map((product, index) => (
          <StorefrontReveal key={product.id} index={Math.min(index, 8)}>
            {renderCatalogProductCard(catalogVertical, product)}
          </StorefrontReveal>
        ))}

        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <StorefrontSkeletonProductCard key={`loading-${index}`} />
            ))
          : null}
      </div>

      <div ref={sentinelRef} className="h-px" aria-hidden />

      {hasMore && !loading ? (
        <p
          className={cn(
            "mt-6 text-center text-sm",
            isVape ? "text-vape-muted" : "text-neutral-500",
          )}
        >
          Mostrando {visibleProducts.length} de {products.length}
        </p>
      ) : null}

      {!hasMore && products.length > 0 ? (
        <p
          className={cn(
            "mt-6 text-center text-sm",
            isVape ? "text-vape-muted" : "text-neutral-500",
            products.length <= CATALOG_PAGE_SIZE && "sr-only",
          )}
        >
          {products.length} producto{products.length !== 1 ? "s" : ""} en total
        </p>
      ) : null}
    </>
  );
}
