import type { ReactNode } from "react";
import {
  adminCardClass,
  adminCardHeaderClass,
  adminCardInsetClass,
} from "@/components/admin/admin-surface";
import {
  AdminTableScroll,
  adminTableBodyClass,
  adminTableClass,
  adminTableHeadClass,
  adminTableRowClass,
  adminTableTdClass,
  adminTableThClass,
} from "@/components/admin/admin-table";
import {
  adminFiltersAsideClass,
  adminFiltersPanelScrollClass,
  adminListLayoutRowClass,
  adminListMainColumnClass,
  adminOrdersMainColumnClass,
} from "@/lib/admin-list-layout";
import { cn } from "@/lib/utils";

type AdminSkeletonProps = {
  className?: string;
};

export function AdminSkeleton({ className }: AdminSkeletonProps) {
  return <div className={cn("admin-skeleton rounded-md", className)} aria-hidden />;
}

export function AdminSkeletonRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

function AdminSkeletonCardShell({
  titleWidth = "w-24",
  descriptionWidth,
  padding = true,
  className,
  children,
}: {
  titleWidth?: string;
  descriptionWidth?: string;
  padding?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn(adminCardClass, className)}>
      <div className={adminCardHeaderClass}>
        <AdminSkeleton className={cn("h-4", titleWidth)} />
        {descriptionWidth ? (
          <AdminSkeleton className={cn("mt-2 h-3", descriptionWidth)} />
        ) : null}
      </div>
      {children ? (
        <div className={cn(padding && "p-4 sm:p-6")}>{children}</div>
      ) : null}
    </div>
  );
}

export function AdminSkeletonPageHeader({
  titleWidth = "w-36",
  descriptionWidth = "w-64",
}: {
  titleWidth?: string;
  descriptionWidth?: string;
}) {
  return (
    <div className="mb-8">
      <AdminSkeleton className={cn("h-8", titleWidth)} />
      <AdminSkeleton className={cn("mt-2 h-4", descriptionWidth)} />
    </div>
  );
}

function AdminSkeletonStatCard() {
  return (
    <div className={adminCardClass}>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="space-y-2">
          <AdminSkeleton className="h-4 w-20" />
          <AdminSkeleton className="h-8 w-16" />
        </div>
        <AdminSkeleton className="size-10 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

function AdminSkeletonChartArea() {
  return (
    <div className="space-y-4">
      <div className="flex gap-6">
        <AdminSkeleton className="h-4 w-24" />
        <AdminSkeleton className="h-4 w-28" />
      </div>
      <AdminSkeleton className="h-48 w-full rounded-lg sm:h-56" />
      <div className="flex justify-between gap-2">
        {Array.from({ length: 7 }, (_, index) => (
          <AdminSkeleton key={index} className="h-3 flex-1 max-w-10" />
        ))}
      </div>
    </div>
  );
}

function AdminSkeletonTopProducts() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <AdminSkeleton className="size-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <AdminSkeleton className="h-4 w-full max-w-40" />
            <AdminSkeleton className="h-3 w-16" />
          </div>
          <AdminSkeleton className="h-4 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function AdminSkeletonRankedList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-start justify-between gap-3 py-0.5">
          <div className="min-w-0 flex-1 space-y-1.5">
            <AdminSkeleton className="h-4 w-full max-w-48" />
            <AdminSkeleton className="h-3 w-36 max-w-full" />
          </div>
          <AdminSkeleton className="h-4 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function AdminSkeletonComparisonMetricCard() {
  return (
    <div className={cn(adminCardClass, "h-full")}>
      <div className={adminCardHeaderClass}>
        <AdminSkeleton className="h-4 w-24" />
      </div>
      <div className="p-4 sm:p-6">
        <AdminSkeleton className="h-9 w-28" />
        <AdminSkeleton className="mt-2 h-3 w-36" />
      </div>
    </div>
  );
}

function AdminSkeletonFunnelBars() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <AdminSkeleton className="h-4 w-28" />
            <AdminSkeleton className="h-4 w-8" />
          </div>
          <AdminSkeleton className="h-3 w-full rounded-full" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="space-y-1.5">
            <AdminSkeleton className="h-3 w-24" />
            <AdminSkeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSkeletonCohortGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-1.5">
          <AdminSkeleton className="h-3 w-24" />
          <AdminSkeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton del módulo /admin/modulos/analytics (no confundir con el del dashboard). */
export function AdminSkeletonAdvancedAnalytics() {
  return (
    <AdminSkeletonRegion label="Cargando analytics" className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSkeleton className="h-4 w-full max-w-md" />
        <div className="flex flex-wrap items-center gap-2">
          <AdminSkeleton className="h-9 w-32 rounded-lg" />
          <AdminSkeletonTabs />
        </div>
      </div>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <AdminSkeletonComparisonMetricCard key={index} />
        ))}
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <AdminSkeletonCardShell titleWidth="w-36" descriptionWidth="w-56" className="h-full">
          <AdminSkeletonFunnelBars />
        </AdminSkeletonCardShell>
        <AdminSkeletonCardShell titleWidth="w-40" descriptionWidth="w-64" className="h-full">
          <AdminSkeletonCohortGrid />
        </AdminSkeletonCardShell>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <AdminSkeletonCardShell titleWidth="w-36" descriptionWidth="w-56">
            <div className="mb-4 flex justify-end">
              <AdminSkeletonTabs />
            </div>
            <AdminSkeletonChartArea />
          </AdminSkeletonCardShell>
          <AdminSkeletonCardShell titleWidth="w-40" descriptionWidth="w-72">
            <AdminSkeletonRankedList rows={5} />
          </AdminSkeletonCardShell>
        </div>

        <div className="space-y-6">
          <AdminSkeletonCardShell titleWidth="w-32" descriptionWidth="w-48">
            <AdminSkeletonTopProducts />
          </AdminSkeletonCardShell>
          <AdminSkeletonCardShell titleWidth="w-32" descriptionWidth="w-52">
            <AdminSkeletonRankedList rows={4} />
          </AdminSkeletonCardShell>
        </div>
      </div>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonExportsPanel() {
  return (
    <AdminSkeletonRegion
      label="Cargando exportaciones"
      className="space-y-6 border-t border-neutral-200 pt-8"
    >
      <div>
        <AdminSkeleton className="h-6 w-36" />
        <AdminSkeleton className="mt-2 h-4 w-full max-w-2xl" />
      </div>
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <AdminSkeletonCardShell titleWidth="w-32" descriptionWidth="w-64" className="h-full">
          <div className="space-y-4">
            <AdminSkeleton className="h-4 w-56" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-1.5">
                  <AdminSkeleton className="h-3 w-16" />
                  <AdminSkeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
            <AdminSkeleton className="h-10 w-44 rounded-lg" />
          </div>
        </AdminSkeletonCardShell>
        <AdminSkeletonCardShell titleWidth="w-36" descriptionWidth="w-56" className="h-full">
          <div className="flex h-full flex-col">
            <AdminSkeleton className="h-4 w-full max-w-md" />
            <div className="mt-auto pt-4">
              <AdminSkeleton className="h-10 w-48 rounded-lg" />
            </div>
          </div>
        </AdminSkeletonCardShell>
      </div>
    </AdminSkeletonRegion>
  );
}

function skeletonCellForColumn(column: string, colIndex: number, colCount: number) {
  if (column === "Imagen") {
    return (
      <AdminSkeleton className="h-16 w-12 shrink-0 rounded-md lg:h-12 lg:w-9" />
    );
  }

  if (column === "Producto") {
    return (
      <div className="space-y-1.5">
        <AdminSkeleton className="h-4 w-36 max-w-full" />
        <AdminSkeleton className="h-3 w-24 max-w-full" />
      </div>
    );
  }

  if (column === "Cant.") {
    return <AdminSkeleton className="h-4 w-8" />;
  }

  if (column === "Subtotal") {
    return <AdminSkeleton className="ml-auto h-4 w-16" />;
  }

  if (column === "Acciones" || colIndex === colCount - 1) {
    return <AdminSkeleton className="size-8 rounded-lg" />;
  }

  const widthByColumn: Record<string, string> = {
    Color: "w-24",
    "Talle / Color": "w-28",
    SKU: "w-20",
    Precio: "w-16",
    Stock: "w-10",
  };

  return (
    <AdminSkeleton className={cn("h-4", widthByColumn[column] ?? "w-20")} />
  );
}

export function AdminDataTableSkeleton({
  columns,
  rows = 4,
  scrollClassName,
  tableClassName,
  ariaLabel = "Cargando",
  skeletonHeaders = false,
}: {
  columns: string[];
  rows?: number;
  scrollClassName?: string;
  tableClassName?: string;
  ariaLabel?: string;
  skeletonHeaders?: boolean;
}) {
  return (
    <AdminTableScroll
      className={scrollClassName}
      aria-busy
      aria-label={ariaLabel}
    >
      <table className={cn(adminTableClass, tableClassName)}>
        <thead className={adminTableHeadClass}>
          <tr>
            {columns.map((column) => (
              <th key={column} className={adminTableThClass}>
                {skeletonHeaders ? (
                  <AdminSkeleton className="h-3 w-16" />
                ) : (
                  column
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={adminTableBodyClass}>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex} className={adminTableRowClass}>
              {columns.map((column, colIndex) => (
                <td key={column} className={adminTableTdClass}>
                  {skeletonCellForColumn(column, colIndex, columns.length)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableScroll>
  );
}

function AdminSkeletonTable({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <AdminDataTableSkeleton
      columns={Array.from({ length: columns }, (_, index) => `Col ${index + 1}`)}
      rows={rows}
      skeletonHeaders
    />
  );
}

export function AdminSkeletonOrderCard() {
  return (
    <div className={adminCardClass}>
      <div className={adminCardHeaderClass}>
        <div className="flex items-center justify-between gap-4">
          <AdminSkeleton className="h-5 w-36 max-w-[50%]" />
          <div className="flex shrink-0 flex-col items-end gap-2">
            <AdminSkeleton className="h-7 w-24" />
            <AdminSkeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <AdminSkeleton className="mt-1 h-4 w-48 max-w-full" />
      </div>

      <div
        className={cn(
          adminCardInsetClass,
          "border-b border-neutral-100 py-4",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <AdminSkeleton className="h-3 w-14" />
              <AdminSkeleton className="mt-2 h-4 w-full max-w-44" />
              <AdminSkeleton className="mt-1.5 h-4 w-28 max-w-full" />
            </div>
          ))}
        </div>
      </div>

      <AdminDataTableSkeleton
        columns={["Producto", "Cant.", "Subtotal"]}
        rows={1}
        skeletonHeaders
        ariaLabel="Cargando ítems del pedido"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50/50 px-4 py-3 sm:px-6">
        <AdminSkeleton className="h-4 w-44" />
        <AdminSkeleton className="h-9 w-36 rounded-lg" />
      </div>
    </div>
  );
}

export function AdminSkeletonDashboardAttention() {
  return (
    <AdminSkeletonRegion label="Cargando alertas" className="mb-8">
      <AdminSkeleton className="mb-3 h-4 w-40" />
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminSkeleton className="h-[4.5rem] w-full rounded-xl" />
        <AdminSkeleton className="h-[4.5rem] w-full rounded-xl" />
      </div>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonDashboardAnalytics() {
  return (
    <AdminSkeletonRegion
      label="Cargando actividad de ventas"
      className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]"
    >
      <AdminSkeletonCardShell
        titleWidth="w-36"
        descriptionWidth="w-56"
      >
        <div className="mb-4 flex justify-end">
          <AdminSkeletonTabs />
        </div>
        <AdminSkeletonChartArea />
      </AdminSkeletonCardShell>

      <AdminSkeletonCardShell
        titleWidth="w-44"
        descriptionWidth="w-52"
      >
        <AdminSkeletonTopProducts />
      </AdminSkeletonCardShell>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonDashboardRecentOrders() {
  return (
    <AdminSkeletonRegion label="Cargando pedidos recientes">
      <AdminSkeletonCardShell titleWidth="w-36" padding={false}>
        <AdminSkeletonTable columns={5} />
      </AdminSkeletonCardShell>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonDashboardPage() {
  return (
    <AdminSkeletonRegion label="Cargando dashboard" className="pb-2">
      <AdminSkeletonPageHeader
        titleWidth="w-32"
        descriptionWidth="w-72"
      />

      <AdminSkeletonDashboardAttention />

      <AdminSkeletonDashboardAnalytics />

      <AdminSkeletonDashboardRecentOrders />
    </AdminSkeletonRegion>
  );
}

/** Catálogo sin filtros activos: card + tabla vacía (estado inicial de /admin/productos). */
function AdminSkeletonProductsCatalogAwaiting() {
  return (
    <div className={cn(adminCardClass, "space-y-0 pb-2")}>
      <div className={adminCardHeaderClass}>
        <div className="flex items-center justify-between gap-4">
          <AdminSkeleton className="h-5 w-20" />
          <AdminSkeleton className="h-9 w-32 shrink-0 rounded-lg" />
        </div>
        <AdminSkeleton className="mt-1 h-3 w-full max-w-md" />
      </div>
      <AdminTableScroll>
        <table className={adminTableClass}>
          <thead className={adminTableHeadClass}>
            <tr>
              {[
                "w-16",
                "w-20",
                "w-12",
                "w-16",
                "w-12",
                "w-14",
              ].map((width, index) => (
                <th key={index} className={adminTableThClass}>
                  <AdminSkeleton className={cn("h-3", width)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={adminTableBodyClass}>
            <tr className={cn(adminTableRowClass, "hover:bg-transparent")}>
              <td
                colSpan={6}
                className={cn(adminTableTdClass, "py-12 text-center")}
              >
                <AdminSkeleton className="mx-auto h-4 w-72 max-w-full" />
              </td>
            </tr>
          </tbody>
        </table>
      </AdminTableScroll>
    </div>
  );
}

function AdminSkeletonCollapsibleCardHeader({
  titleWidth = "w-36",
  descriptionWidth = "w-56",
  withAction = false,
  actionWidth = "w-28",
}: {
  titleWidth?: string;
  descriptionWidth?: string;
  withAction?: boolean;
  actionWidth?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch">
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-4",
          adminCardHeaderClass,
        )}
      >
        <AdminSkeleton className="size-8 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <AdminSkeleton className={cn("h-5", titleWidth)} />
          <AdminSkeleton className={cn("h-3 max-w-full", descriptionWidth)} />
        </div>
      </div>
      {withAction ? (
        <div
          className={cn(
            "flex items-center sm:border-l",
            adminCardHeaderClass,
            "py-3 sm:py-4",
          )}
        >
          <AdminSkeleton className={cn("h-9 rounded-lg", actionWidth)} />
        </div>
      ) : null}
    </div>
  );
}

function AdminSkeletonProductEditForm() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminSkeletonFormField labelWidth="w-16" />
        <AdminSkeletonFormField labelWidth="w-20" />
        <div className="space-y-1 sm:col-span-2">
          <AdminSkeleton className="h-4 w-24" />
          <AdminSkeleton className="h-24 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <AdminSkeleton className="size-4 rounded" />
          <AdminSkeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex justify-end border-t border-neutral-100 pt-4">
        <AdminSkeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export function AdminSkeletonProductEditPage() {
  return (
    <AdminSkeletonRegion label="Cargando producto" className="space-y-6 pb-8">
      <div>
        <AdminSkeleton className="mb-4 h-4 w-36" />
        <AdminSkeleton className="h-8 w-56 max-w-full" />
        <AdminSkeleton className="mt-2 h-4 w-28" />
      </div>

      <div className="space-y-6">
        <div className={adminCardClass}>
          <AdminSkeletonCollapsibleCardHeader
            titleWidth="w-36"
            descriptionWidth="w-72"
          />
          <AdminSkeletonProductEditForm />
        </div>

        <div className={adminCardClass}>
          <AdminSkeletonCollapsibleCardHeader
            titleWidth="w-16"
            descriptionWidth="w-44"
            withAction
            actionWidth="w-28"
          />
        </div>

        <div className={adminCardClass}>
          <AdminSkeletonCollapsibleCardHeader
            titleWidth="w-24"
            descriptionWidth="w-36"
            withAction
            actionWidth="w-32"
          />
        </div>
      </div>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonProductsPage() {
  return (
    <AdminSkeletonRegion label="Cargando productos">
      <AdminSkeletonPageHeader
        titleWidth="w-28"
        descriptionWidth="w-80"
      />

      <div className={adminListLayoutRowClass}>
        <div className={adminListMainColumnClass}>
          <div className="lg:hidden">
            <AdminSkeletonFiltersPanel variant="products" className="mb-4" />
          </div>

          <AdminSkeletonListToolbar variant="products" />

          <AdminSkeletonProductsCatalogAwaiting />
        </div>

        <aside className={adminFiltersAsideClass}>
          <AdminSkeletonFiltersPanel variant="products" />
        </aside>
      </div>
    </AdminSkeletonRegion>
  );
}

function AdminSkeletonFormField({
  labelWidth = "w-28",
  hint = false,
}: {
  labelWidth?: string;
  hint?: boolean;
}) {
  return (
    <div className="space-y-1">
      <AdminSkeleton className={cn("h-4", labelWidth)} />
      <AdminSkeleton className="h-10 w-full rounded-lg" />
      {hint ? <AdminSkeleton className="h-3 w-56" /> : null}
    </div>
  );
}

export function AdminSkeletonSettingsPage() {
  return (
    <AdminSkeletonRegion label="Cargando configuración">
      <AdminSkeletonPageHeader
        titleWidth="w-36"
        descriptionWidth="w-80"
      />

      <div className={cn(adminCardClass, "max-w-lg")}>
        <div className={adminCardHeaderClass}>
          <AdminSkeleton className="h-4 w-32" />
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="space-y-1">
            <AdminSkeleton className="h-4 w-28" />
            <div className="flex overflow-hidden rounded-lg border border-neutral-200">
              <AdminSkeleton className="h-10 min-w-0 flex-1 rounded-none" />
              <AdminSkeleton className="h-10 w-28 shrink-0 rounded-none border-l border-neutral-200" />
            </div>
            <AdminSkeleton className="h-3 w-64" />
          </div>

          <AdminSkeletonFormField labelWidth="w-44" />

          <div className="flex items-center gap-2">
            <AdminSkeleton className="size-4 shrink-0 rounded-sm" />
            <AdminSkeleton className="h-4 w-40" />
          </div>

          <AdminSkeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonOrdersDescription() {
  return <AdminSkeleton className="mt-2 h-4 w-72 max-w-full" />;
}

export function AdminSkeletonOrdersMobileFilters() {
  return (
    <div className="lg:hidden">
      <AdminSkeletonFiltersPanel variant="orders" className="mb-4" />
    </div>
  );
}

export function AdminSkeletonOrdersDesktopFilters() {
  return (
    <aside className={adminFiltersAsideClass}>
      <AdminSkeletonFiltersPanel variant="orders" />
    </aside>
  );
}

export function AdminSkeletonOrdersList() {
  return (
    <AdminSkeletonRegion label="Cargando listado de pedidos" className="space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <AdminSkeletonOrderCard key={index} />
      ))}
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonOrdersPage() {
  return (
    <AdminSkeletonRegion label="Cargando pedidos">
      <AdminSkeletonPageHeader
        titleWidth="w-28"
        descriptionWidth="w-72"
      />

      <div className={adminListLayoutRowClass}>
        <div className={adminOrdersMainColumnClass}>
          <div className="lg:hidden">
            <AdminSkeletonFiltersPanel variant="orders" className="mb-4" />
          </div>

          <AdminSkeletonListToolbar variant="orders" />
          <AdminSkeletonFilterChips />

          {Array.from({ length: 3 }, (_, index) => (
            <AdminSkeletonOrderCard key={index} />
          ))}
        </div>

        <aside className={adminFiltersAsideClass}>
          <AdminSkeletonFiltersPanel variant="orders" />
        </aside>
      </div>
    </AdminSkeletonRegion>
  );
}

export function AdminSkeletonTabs({ className }: { className?: string }) {
  return (
    <AdminSkeletonRegion
      label="Cargando selector de período"
      className={className}
    >
      <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1">
        <AdminSkeleton className="h-8 w-16 rounded-md sm:w-[4.25rem]" />
        <AdminSkeleton className="h-8 w-14 rounded-md sm:w-16" />
        <AdminSkeleton className="h-8 w-12 rounded-md sm:w-14" />
      </div>
    </AdminSkeletonRegion>
  );
}

const FILTER_STATUS_ROWS = 6;

function AdminSkeletonFilterButtons({ rows }: { rows: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }, (_, index) => (
        <AdminSkeleton key={index} className="h-9 w-full rounded-lg" />
      ))}
    </div>
  );
}

function AdminSkeletonFilterSection({
  titleWidth = "w-20",
  rows,
}: {
  titleWidth?: string;
  rows: number;
}) {
  return (
    <div className="border-t border-neutral-100 px-4 py-3">
      <AdminSkeleton className={cn("mb-2 h-3", titleWidth)} />
      <AdminSkeletonFilterButtons rows={rows} />
    </div>
  );
}

function AdminSkeletonFacetFiltersCard({
  sections,
}: {
  sections: Array<{ titleWidth?: string; rows: number }>;
}) {
  return (
    <div className={adminCardClass}>
      <div className={adminCardHeaderClass}>
        <AdminSkeleton className="h-4 w-16" />
        <AdminSkeleton className="mt-2 h-3 w-44" />
      </div>
      {sections.map((section, index) => (
        <AdminSkeletonFilterSection
          key={index}
          titleWidth={section.titleWidth}
          rows={section.rows}
        />
      ))}
    </div>
  );
}

export function AdminSkeletonListToolbar({
  variant = "products",
  className,
}: {
  variant?: "products" | "orders";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          variant === "products" && "lg:flex-row lg:items-end",
        )}
      >
        <AdminSkeleton className="h-10 w-full rounded-lg" />
        {variant === "products" ? (
          <AdminSkeleton className="h-10 w-full rounded-lg lg:w-52" />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <AdminSkeleton className="h-10 w-full rounded-lg" />
              <AdminSkeleton className="h-10 w-full rounded-lg" />
            </div>
            <AdminSkeleton className="h-9 w-28 shrink-0 rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminSkeletonFilterChips({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <AdminSkeleton className="h-7 w-24 rounded-full" />
      <AdminSkeleton className="h-7 w-20 rounded-full" />
    </div>
  );
}

export function AdminSkeletonFiltersPanel({
  className,
  variant = "orders",
}: {
  className?: string;
  variant?: "products" | "orders";
}) {
  return (
    <AdminSkeletonRegion
      label={
        variant === "products"
          ? "Cargando filtros de productos"
          : "Cargando filtros de pedidos"
      }
      className={cn(adminFiltersPanelScrollClass, className)}
    >
      {variant === "products" ? (
        <AdminSkeletonFacetFiltersCard
          sections={[
            { titleWidth: "w-20", rows: 8 },
            { titleWidth: "w-14", rows: 4 },
            { titleWidth: "w-12", rows: 4 },
          ]}
        />
      ) : (
        <AdminSkeletonFacetFiltersCard
          sections={[{ titleWidth: "w-20", rows: FILTER_STATUS_ROWS }]}
        />
      )}
    </AdminSkeletonRegion>
  );
}
