"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { StoreAfipSettingsData } from "@/lib/afip";

type AdminAfipSettingsPanelProps = {
  settings: StoreAfipSettingsData;
};

export function AdminAfipSettingsPanel({
  settings: initialSettings,
}: AdminAfipSettingsPanelProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/afip-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar la configuración AFIP.");
      }

      setSaved(true);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la configuración AFIP.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard
      title="Facturación AFIP"
      description="Preparación para emitir comprobantes al confirmar el pago. El WS de AFIP se integrará en una fase posterior (NEX-6)."
    >
      <AdminForm onSubmit={handleSubmit} className="space-y-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={settings.enabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                enabled: event.target.checked,
              }))
            }
          />
          Encolar facturación al pagar (marca pedido como Pendiente AFIP)
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="afip-environment">Entorno</Label>
            <select
              id="afip-environment"
              className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm"
              value={settings.environment}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  environment:
                    event.target.value === "PRODUCTION"
                      ? "PRODUCTION"
                      : "HOMOLOGATION",
                }))
              }
            >
              <option value="HOMOLOGATION">Homologación (pruebas)</option>
              <option value="PRODUCTION">Producción</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="afip-punto-venta">Punto de venta</Label>
            <Input
              id="afip-punto-venta"
              type="number"
              min={1}
              max={99999}
              value={settings.puntoVenta ?? ""}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  puntoVenta: event.target.value
                    ? Number(event.target.value)
                    : null,
                }))
              }
              placeholder="1"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="afip-merchant-cuit">CUIT del comercio</Label>
            <Input
              id="afip-merchant-cuit"
              value={settings.merchantCuit ?? ""}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  merchantCuit: event.target.value,
                }))
              }
              placeholder="30-12345678-9"
            />
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          Con AFIP activo, al pagar un pedido se guarda estado Pendiente AFIP y el
          webhook <code>order.paid</code> incluye ítems, montos y CUIT del cliente.
          Certificados y emisión real pendientes de implementación.
        </p>

        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">Configuración AFIP guardada.</AdminFormAlert>
        ) : null}

        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar AFIP"}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCard>
  );
}
