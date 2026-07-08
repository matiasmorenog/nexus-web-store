"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminForm, AdminFormGrid, adminSelectClass } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORDER_STATUSES, getOrderStatusLabel } from "@/lib/order-status";

function buildOrdersExportUrl(filters: {
  desde: string;
  hasta: string;
  estado: string;
  q: string;
  todos: boolean;
}) {
  const params = new URLSearchParams();
  if (filters.todos) {
    params.set("todos", "1");
  } else {
    if (filters.desde) params.set("desde", filters.desde);
    if (filters.hasta) params.set("hasta", filters.hasta);
  }
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  const query = params.toString();
  return `/api/admin/exports/orders${query ? `?${query}` : ""}`;
}

type AdminExportsPanelProps = {
  defaultDesde: string;
  defaultHasta: string;
};

export function AdminExportsPanel({
  defaultDesde,
  defaultHasta,
}: AdminExportsPanelProps) {
  const [desde, setDesde] = useState(defaultDesde);
  const [hasta, setHasta] = useState(defaultHasta);
  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const [todos, setTodos] = useState(false);

  const ordersUrl = buildOrdersExportUrl({ desde, hasta, estado, q, todos });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AdminCard
        title="Exportar pedidos"
        description="CSV con resumen de pedidos. Compatible con Excel (UTF-8)."
      >
        <AdminForm
          onSubmit={(event) => {
            event.preventDefault();
            window.location.href = ordersUrl;
          }}
        >
          <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={todos}
              onChange={(event) => setTodos(event.target.checked)}
            />
            Todos los pedidos (sin filtro de fecha)
          </label>

          <AdminFormGrid>
            <div>
              <Label htmlFor="export-desde">Desde</Label>
              <Input
                id="export-desde"
                type="date"
                value={desde}
                disabled={todos}
                onChange={(event) => setDesde(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="export-hasta">Hasta</Label>
              <Input
                id="export-hasta"
                type="date"
                value={hasta}
                disabled={todos}
                onChange={(event) => setHasta(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="export-estado">Estado</Label>
              <select
                id="export-estado"
                className={adminSelectClass}
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
              >
                <option value="">Todos</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="export-q">Buscar cliente / ID</Label>
              <Input
                id="export-q"
                value={q}
                placeholder="Nombre, email, teléfono..."
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
          </AdminFormGrid>

          <Button type="submit" className="mt-4">
            <Download className="mr-2 h-4 w-4" />
            Descargar pedidos.csv
          </Button>
        </AdminForm>
      </AdminCard>

      <AdminCard
        title="Exportar productos"
        description="CSV con una fila por variante (SKU, precio, stock)."
      >
        <p className="mb-4 text-sm text-neutral-600">
          Incluye todo el catálogo de la tienda activa, ordenado por fecha de alta.
        </p>
        {/* File download — <a> is intentional (not a Next.js page route). */}
        <a
          href="/api/admin/exports/products"
          download
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--ui-button-radius,0.5rem)] bg-[var(--brand-primary)] px-4 text-sm font-[var(--ui-button-font-weight,500)] text-[var(--ui-button-primary-foreground,white)] shadow-[var(--ui-button-primary-shadow,none)] transition-colors hover:brightness-95 active:brightness-90"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar productos.csv
        </a>
      </AdminCard>
    </div>
  );
}
