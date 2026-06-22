"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminOrderCardData } from "@/components/admin/admin-order-card";
import { AdminOrderCard } from "@/components/admin/admin-order-card";
import { AdminSkeletonOrderCard } from "@/components/admin/admin-skeleton";
import type { AdminOrdersFilterParams } from "@/lib/admin-orders-query";
import { cn } from "@/lib/utils";

type AdminOrdersListProps = {
  initialOrders: AdminOrderCardData[];
  total: number;
  hasMore: boolean;
  filters: AdminOrdersFilterParams;
};

function buildAdminOrdersUrl(page: number, filters: AdminOrdersFilterParams) {
  const params = new URLSearchParams({ page: String(page) });

  if (filters.estado) params.set("estado", filters.estado);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.showAll) {
    params.set("todos", "1");
  } else {
    if (filters.desde) params.set("desde", filters.desde);
    if (filters.hasta) params.set("hasta", filters.hasta);
  }

  return `/api/admin/orders?${params.toString()}`;
}

export function AdminOrdersList({
  initialOrders,
  total,
  hasMore: initialHasMore,
  filters,
}: AdminOrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrders(initialOrders);
    setPage(1);
    setHasMore(initialHasMore);
    setLoading(false);
  }, [initialOrders, initialHasMore]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#pedido-")) return;

    const target = document.querySelector(hash);
    if (!(target instanceof HTMLElement)) return;

    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => cancelAnimationFrame(frame);
  }, [initialOrders]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(buildAdminOrdersUrl(nextPage, filters));
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al cargar pedidos");
      }

      setOrders((current) => {
        const seen = new Set(current.map((order) => order.id));
        const next = data.orders.filter(
          (order: AdminOrderCardData) => !seen.has(order.id),
        );
        return [...current, ...next];
      });
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, hasMore, loading, page]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const scrollRoot = node.closest("[data-admin-scroll-area]");

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      {
        root: scrollRoot instanceof HTMLElement ? scrollRoot : null,
        rootMargin: "320px 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
        <p className="font-medium text-neutral-900">No hay pedidos</p>
        <p className="mt-2 text-sm text-neutral-500">
          Probá con otros filtros o ampliá el rango de fechas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} id={`pedido-${order.id}`} className="scroll-mt-6">
          <AdminOrderCard order={order} />
        </div>
      ))}

      {loading
        ? Array.from({ length: 2 }, (_, index) => (
            <AdminSkeletonOrderCard key={`loading-${index}`} />
          ))
        : null}

      <div ref={sentinelRef} className="h-px" aria-hidden />

      {hasMore && !loading ? (
        <p className="pt-2 text-center text-sm text-neutral-500">
          Mostrando {orders.length} de {total}
        </p>
      ) : null}

      {!hasMore && orders.length > 0 ? (
        <p
          className={cn(
            "pt-2 text-center text-sm text-neutral-500",
            orders.length <= 10 && "sr-only",
          )}
        >
          {orders.length} pedido{orders.length !== 1 ? "s" : ""} en total
        </p>
      ) : null}
    </div>
  );
}
