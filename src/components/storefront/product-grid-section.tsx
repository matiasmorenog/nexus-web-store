"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontReveal } from "@/components/storefront/storefront-reveal";
import { StorefrontSkeletonProductCard } from "@/components/storefront/storefront-skeleton";
import type { CatalogProductRow } from "@/lib/catalog-products-query";
import type { ProductGridParams } from "@/components/storefront/product-grid";
import { cn } from "@/lib/utils";

type ProductGridSectionProps = {
  initialProducts: CatalogProductRow[];
  total: number;
  hasMore: boolean;
  params: ProductGridParams;
};

function buildCatalogProductsUrl(page: number, params: ProductGridParams) {
  const searchParams = new URLSearchParams({ page: String(page) });

  if (params.categoria) searchParams.set("categoria", params.categoria);
  if (params.genero) searchParams.set("genero", params.genero);
  if (params.talle) searchParams.set("talle", params.talle);
  if (params.precioMax) searchParams.set("precioMax", params.precioMax);
  if (params.q?.trim()) searchParams.set("q", params.q.trim());
  if (params.orden) searchParams.set("orden", params.orden);
  if (params.promo) searchParams.set("promo", params.promo);
  if (params.destacados) searchParams.set("destacados", params.destacados);

  return `/api/catalog/products?${searchParams.toString()}`;
}

export function ProductGridSection({
  initialProducts,
  total,
  hasMore: initialHasMore,
  params,
}: ProductGridSectionProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
    setLoading(false);
  }, [initialProducts, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(buildCatalogProductsUrl(nextPage, params));
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al cargar productos");
      }

      setProducts((current) => {
        const seen = new Set(current.map((product) => product.id));
        const next = data.products.filter(
          (product: CatalogProductRow) => !seen.has(product.id),
        );
        return [...current, ...next];
      });
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error("Catalog load more error:", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, params]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-[var(--brand-primary-soft)]/40 px-6 py-16 text-center">
        <p className="font-medium text-neutral-900">No se encontraron productos</p>
        <p className="mt-2 text-sm text-neutral-500">
          Probá con otros filtros o una búsqueda distinta.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5">
        {products.map((product, index) => (
          <StorefrontReveal key={product.id} index={Math.min(index, 8)}>
            <ProductCard
              slug={product.slug}
              name={product.name}
              category={product.category}
              audience={product.audience}
              imageUrl={product.imageUrl}
              hoverImageUrl={product.hoverImageUrl}
              price={product.price}
              inStock={product.inStock}
              promo2x1={product.promo2x1}
            />
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
        <p className="mt-6 text-center text-sm text-neutral-500">
          Mostrando {products.length} de {total}
        </p>
      ) : null}

      {!hasMore && products.length > 0 ? (
        <p
          className={cn(
            "mt-6 text-center text-sm text-neutral-500",
            products.length <= 12 && "sr-only",
          )}
        >
          {products.length} producto{products.length !== 1 ? "s" : ""} en total
        </p>
      ) : null}
    </>
  );
}
