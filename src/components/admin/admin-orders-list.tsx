"use client";

import { useState } from "react";
import type { AdminOrderCardData } from "@/components/admin/admin-order-card";
import { AdminOrderCard } from "@/components/admin/admin-order-card";
import { AdminLoadMore } from "@/components/admin/admin-load-more";
import type { AdminOrdersFilterParams } from "@/lib/admin-orders-query";

type AdminOrdersListProps = {
  initialOrders: AdminOrderCardData[];
  total: number;
  hasMore: boolean;
  filters: AdminOrdersFilterParams;
};

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

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
      });

      if (filters.estado) params.set("estado", filters.estado);
      if (filters.q?.trim()) params.set("q", filters.q.trim());
      if (filters.desde) params.set("desde", filters.desde);
      if (filters.hasta) params.set("hasta", filters.hasta);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Error al cargar pedidos");
      }

      setOrders((current) => [...current, ...data.orders]);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <AdminOrderCard key={order.id} order={order} />
      ))}

      <AdminLoadMore
        loaded={orders.length}
        total={total}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        label="Cargar más pedidos"
      />
    </div>
  );
}
