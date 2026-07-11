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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  SHIPPING_CARRIER_OPTIONS,
  type StoreShippingSettingsData,
} from "@/lib/shipping-carriers";

type AdminShippingSettingsFormProps = {
  initialSettings: StoreShippingSettingsData;
  mercadoEnviosConfigured: boolean;
  readOnly?: boolean;
};

export function AdminShippingSettingsForm({
  initialSettings,
  mercadoEnviosConfigured,
  readOnly = false,
}: AdminShippingSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar la configuración.");
      }

      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar la configuración.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminForm onSubmit={handleSubmit} className="space-y-6">
      <AdminCard
        title="Cotización en checkout"
        description="Con carriers activos, el envío se calcula por código postal. Sin este módulo, el checkout usa solo el costo fijo de Configuración."
      >
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={settings.carriersEnabled}
            disabled={readOnly}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                carriersEnabled: event.target.checked,
              }))
            }
          />
          Activar cotización carrier en checkout
        </label>

        <div className="max-w-md">
          <Label htmlFor="preferred-carrier">Operador preferido</Label>
          <select
            id="preferred-carrier"
            className="mt-1.5 flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            value={settings.preferredCarrierId}
            disabled={readOnly || !settings.carriersEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                preferredCarrierId: event.target
                  .value as StoreShippingSettingsData["preferredCarrierId"],
              }))
            }
          >
            {SHIPPING_CARRIER_OPTIONS.map((carrier) => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.label}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      <AdminCard
        title="Estado de integración"
        description="Hoy la API real de Mercado Envíos no está conectada; en demo se generan cotizaciones y códigos de seguimiento simulados."
      >
        <p className="text-sm text-neutral-600">
          Token Mercado Envíos:{" "}
          <strong className="text-neutral-900">
            {mercadoEnviosConfigured ? "Configurado en servidor" : "Modo demo"}
          </strong>
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Para producción, configurá{" "}
          <code className="rounded bg-neutral-100 px-1 text-xs">
            MERCADOENVIOS_ACCESS_TOKEN
          </code>{" "}
          en Vercel. El costo fijo de respaldo sigue definido en{" "}
          <strong>Configuración → Costo de envío fijo</strong>.
        </p>
      </AdminCard>

      {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
      {saved ? (
        <AdminFormAlert variant="success">
          Configuración guardada. Los cambios aplican en el checkout al instante.
        </AdminFormAlert>
      ) : null}

      {readOnly ? (
        <p className="text-sm text-neutral-500">Solo lectura.</p>
      ) : (
        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar envíos"}
          </Button>
        </AdminFormActions>
      )}
    </AdminForm>
  );
}
