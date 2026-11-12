"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Trash2 } from "lucide-react";
import { AdminSearchField } from "@/components/admin/admin-filters";
import { adminSurfaceClass } from "@/components/admin/admin-surface";
import { useAdminListNavigation } from "@/components/admin/use-admin-list-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MenuSelect } from "@/components/ui/menu-select";
import {
  buildCrmListHref,
  crmFiltersAreActive,
  crmFiltersToSearchParams,
  type CrmListFilters,
  type CrmListSort,
  type CrmSegment,
} from "@/lib/crm";
import { cn } from "@/lib/utils";

type AdminCrmSearchToolbarProps = {
  className?: string;
  filters: CrmListFilters;
  tags: string[];
  segments: CrmSegment[];
  activeSegmentId?: string | null;
  canManage?: boolean;
};

const INACTIVE_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "30", label: "30+ días" },
  { value: "60", label: "60+ días" },
  { value: "90", label: "90+ días" },
] as const;

const SORT_OPTIONS: { value: CrmListSort; label: string }[] = [
  { value: "lastOrder", label: "Última compra" },
  { value: "totalSpent", label: "Mayor gasto" },
  { value: "orderCount", label: "Más pedidos" },
];

const fieldLabelClass = "mb-1.5 block text-sm text-neutral-600";

export function AdminCrmSearchToolbar({
  className,
  filters,
  tags,
  segments,
  activeSegmentId = null,
  canManage = false,
}: AdminCrmSearchToolbarProps) {
  const navigate = useAdminListNavigation();
  const router = useRouter();
  const [query, setQuery] = useState(filters.q ?? "");
  const [tag, setTag] = useState(filters.tag ?? "");
  const [inactiveDays, setInactiveDays] = useState(
    filters.inactiveDays ? String(filters.inactiveDays) : "",
  );
  const [sort, setSort] = useState<CrmListSort>(filters.sort ?? "lastOrder");
  const [segmentName, setSegmentName] = useState("");
  const [savingSegment, setSavingSegment] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setQuery(filters.q ?? "");
    setTag(filters.tag ?? "");
    setInactiveDays(filters.inactiveDays ? String(filters.inactiveDays) : "");
    setSort(filters.sort ?? "lastOrder");
  }

  const currentFilters = (): CrmListFilters => {
    const next: CrmListFilters = {};
    const trimmedQ = query.trim();
    const trimmedTag = tag.trim();
    if (trimmedQ) next.q = trimmedQ;
    if (trimmedTag) next.tag = trimmedTag;
    if (inactiveDays) {
      const days = Number.parseInt(inactiveDays, 10);
      if (Number.isFinite(days) && days > 0) next.inactiveDays = days;
    }
    if (sort && sort !== "lastOrder") next.sort = sort;
    return next;
  };

  const applyFilters = (next: CrmListFilters, segmentId?: string | null) => {
    navigate(buildCrmListHref(next, segmentId));
  };

  const onSubmitFilters = () => {
    setError(null);
    applyFilters(currentFilters(), null);
  };

  const clearFilters = () => {
    setQuery("");
    setTag("");
    setInactiveDays("");
    setSort("lastOrder");
    setError(null);
    navigate("/admin/modulos/crm");
  };

  const exportHref = () => {
    const params = crmFiltersToSearchParams(filters);
    const search = params.toString();
    return search
      ? `/api/admin/crm/export?${search}`
      : "/api/admin/crm/export";
  };

  const saveSegment = async () => {
    const name = segmentName.trim();
    if (!name) {
      setError("Poné un nombre para el segmento.");
      return;
    }

    setSavingSegment(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/crm/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          filters: currentFilters(),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        segment?: CrmSegment;
      };
      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar el segmento.");
      }
      setSegmentName("");
      router.refresh();
      if (data.segment) {
        applyFilters(data.segment.filters, data.segment.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSavingSegment(false);
    }
  };

  const deleteSegment = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/crm/segments/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "No se pudo eliminar.");
      }
      router.refresh();
      if (activeSegmentId === id) {
        applyFilters(filters, null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtersActive = crmFiltersAreActive(filters) || Boolean(activeSegmentId);

  return (
    <div className={cn("space-y-3", className)}>
      {segments.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Segmentos
          </span>
          {segments.map((segment) => {
            const active = activeSegmentId === segment.id;
            return (
              <div key={segment.id} className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => applyFilters(segment.filters, segment.id)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-sm transition-colors",
                    active
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary-soft)] font-medium text-[var(--brand-primary)]"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50",
                  )}
                >
                  {segment.name}
                </button>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => deleteSegment(segment.id)}
                    disabled={deletingId === segment.id}
                    className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Eliminar segmento ${segment.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className={cn(adminSurfaceClass, "p-4")}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitFilters();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-[220px] flex-1">
              <Label htmlFor="crm-search" className={fieldLabelClass}>
                Buscar
              </Label>
              <AdminSearchField
                bare
                id="crm-search"
                value={query}
                onChange={setQuery}
                onClear={() => setQuery("")}
                placeholder="Nombre, email o teléfono"
                ariaLabel="Buscar cliente"
              />
            </div>

            <div className="w-full sm:w-40">
              <Label htmlFor="crm-tag" className={fieldLabelClass}>
                Tag
              </Label>
              <MenuSelect
                id="crm-tag"
                aria-label="Filtrar por tag"
                value={tag}
                onChange={setTag}
                options={[
                  { value: "", label: "Todos" },
                  ...tags.map((item) => ({ value: item, label: item })),
                ]}
              />
            </div>

            <div className="w-full sm:w-40">
              <Label htmlFor="crm-inactive" className={fieldLabelClass}>
                Sin comprar
              </Label>
              <MenuSelect
                id="crm-inactive"
                aria-label="Sin comprar desde"
                value={inactiveDays}
                onChange={setInactiveDays}
                options={INACTIVE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
            </div>

            <div className="w-full sm:w-44">
              <Label htmlFor="crm-sort" className={fieldLabelClass}>
                Orden
              </Label>
              <MenuSelect
                id="crm-sort"
                aria-label="Ordenar clientes"
                value={sort}
                onChange={(next) => setSort(next as CrmListSort)}
                options={SORT_OPTIONS}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                variant="secondary"
                className="h-10 shrink-0 rounded-md px-4"
              >
                Aplicar filtro
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 rounded-md px-4"
                onClick={() => {
                  window.location.href = exportHref();
                }}
              >
                <Download className="mr-1.5 size-4" />
                CSV
              </Button>
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 px-1 text-sm text-neutral-500 transition-colors hover:text-[var(--brand-primary)]"
                >
                  Limpiar
                </button>
              ) : null}
            </div>
          </div>

          {canManage ? (
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1 sm:max-w-sm">
                  <Label htmlFor="crm-segment-name" className={fieldLabelClass}>
                    Guardar segmento
                  </Label>
                  <Input
                    id="crm-segment-name"
                    value={segmentName}
                    onChange={(event) => setSegmentName(event.target.value)}
                    placeholder="Ej. VIP, recuperar"
                    maxLength={48}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-md px-4"
                  disabled={savingSegment}
                  onClick={() => void saveSegment()}
                >
                  <Plus className="mr-1.5 size-4" />
                  {savingSegment ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </div>
          ) : null}
        </form>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
