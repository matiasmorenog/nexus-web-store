"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type AdminLoadMoreProps = {
  loaded: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  label?: string;
  loadingLabel?: string;
  showingLabel?: string;
  /** Load the next page when the footer scrolls into view (infinite scroll). */
  autoLoad?: boolean;
};

export function AdminLoadMore({
  loaded,
  total,
  hasMore,
  loading,
  onLoadMore,
  label = "Cargar más",
  loadingLabel = "Cargando...",
  showingLabel,
  autoLoad = false,
}: AdminLoadMoreProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!autoLoad || !hasMore || loading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoLoad, hasMore, loading]);

  if (!hasMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="flex flex-col items-center gap-2 border-t border-neutral-100 px-6 py-4 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-neutral-500">
        {showingLabel ?? `Mostrando ${loaded} de ${total}`}
      </p>
      {autoLoad ? (
        loading ? (
          <p className="text-sm text-neutral-500">{loadingLabel}</p>
        ) : null
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? loadingLabel : label}
        </Button>
      )}
    </div>
  );
}
