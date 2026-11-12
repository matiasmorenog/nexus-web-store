"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminCrmCustomersList } from "@/components/admin/admin-crm-customers-list";
import { AdminCrmKpis } from "@/components/admin/admin-crm-kpis";
import { AdminCrmSearchToolbar } from "@/components/admin/admin-crm-search-toolbar";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminFormAlert } from "@/components/admin/admin-form";
import { AdminSkeletonModuleCrmPage } from "@/components/admin/admin-skeleton";
import type {
  CrmCustomerListItem,
  CrmListFilters,
  CrmSegment,
  CrmStoreStats,
} from "@/lib/crm/types";
import {
  useCrmListStore,
  type CrmListSnapshot,
} from "@/stores/crm-list-store";

type AdminCrmListClientProps = {
  canManage: boolean;
};

type ListPayload = {
  filters: CrmListFilters;
  activeSegmentId: string | null;
  listHref: string;
  customers: CrmCustomerListItem[];
  stats: CrmStoreStats;
  tags: string[];
  segments: CrmSegment[];
};

function cacheKeyFromSearch(search: string): string {
  return search ? `/admin/modulos/crm?${search}` : "/admin/modulos/crm";
}

async function fetchCrmListPayload(search: string): Promise<ListPayload> {
  const response = await fetch(
    search ? `/api/admin/crm/list?${search}` : "/api/admin/crm/list",
    { credentials: "same-origin", cache: "no-store" },
  );
  const data = (await response.json()) as ListPayload & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "No se pudo cargar el CRM.");
  }
  return data;
}

export function AdminCrmListClient({ canManage }: AdminCrmListClientProps) {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const cacheKey = cacheKeyFromSearch(search);

  const cached = useCrmListStore((state) => state.byKey[cacheKey] ?? null);
  const setSnapshot = useCrmListStore((state) => state.setSnapshot);

  const [loadError, setLoadError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const error =
    loadError && loadError.key === cacheKey ? loadError.message : null;

  const applyPayload = useCallback(
    (payload: ListPayload) => {
      const next: CrmListSnapshot = {
        cacheKey,
        filters: payload.filters,
        activeSegmentId: payload.activeSegmentId,
        listHref: payload.listHref,
        customers: payload.customers,
        stats: payload.stats,
        tags: payload.tags,
        segments: payload.segments,
      };
      setSnapshot(next);
    },
    [cacheKey, setSnapshot],
  );

  useEffect(() => {
    if (useCrmListStore.getState().byKey[cacheKey]) {
      return;
    }

    let cancelled = false;

    void fetchCrmListPayload(search)
      .then((payload) => {
        if (cancelled) return;
        applyPayload(payload);
        setLoadError(null);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setLoadError({
          key: cacheKey,
          message:
            fetchError instanceof Error
              ? fetchError.message
              : "No se pudo cargar el CRM.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [applyPayload, cacheKey, search]);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchCrmListPayload(search)
      .then((payload) => {
        applyPayload(payload);
        setLoadError(null);
      })
      .catch((fetchError: unknown) => {
        setLoadError({
          key: cacheKey,
          message:
            fetchError instanceof Error
              ? fetchError.message
              : "No se pudo cargar el CRM.",
        });
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const handleSegmentsMutated = () => {
    useCrmListStore.setState((state) => ({
      byKey: state.byKey[cacheKey]
        ? { [cacheKey]: state.byKey[cacheKey] }
        : {},
    }));
    handleRefresh();
  };

  if (!cached && !error) {
    return <AdminSkeletonModuleCrmPage />;
  }

  if (!cached) {
    return (
      <AdminFormAlert variant="error">
        {error ?? "No se pudo cargar el CRM."}
      </AdminFormAlert>
    );
  }

  return (
    <div className="space-y-8">
      {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}

      <AdminDashboardReveal index={0}>
        <AdminCrmKpis stats={cached.stats} />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminCrmSearchToolbar
          filters={cached.filters}
          tags={cached.tags}
          segments={cached.segments}
          activeSegmentId={cached.activeSegmentId}
          canManage={canManage}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onSegmentsMutated={handleSegmentsMutated}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminCrmCustomersList
          customers={cached.customers}
          listHref={cached.listHref}
        />
      </AdminDashboardReveal>
    </div>
  );
}
