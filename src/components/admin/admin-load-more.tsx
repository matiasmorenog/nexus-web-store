"use client";

import { Button } from "@/components/ui/button";

type AdminLoadMoreProps = {
  loaded: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  label?: string;
};

export function AdminLoadMore({
  loaded,
  total,
  hasMore,
  loading,
  onLoadMore,
  label = "Cargar más",
}: AdminLoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className="flex flex-col items-center gap-2 border-t border-neutral-100 px-6 py-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-neutral-500">
        Mostrando {loaded} de {total}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onLoadMore}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? "Cargando..." : label}
      </Button>
    </div>
  );
}
