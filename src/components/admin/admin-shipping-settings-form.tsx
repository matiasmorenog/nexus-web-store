"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminSelect,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  SHIPPING_CARRIER_OPTIONS,
  type StoreShippingSettingsAdminData,
  type StoreShippingSettingsSaveInput,
} from "@/lib/shipping-carriers";

const SOURCE_LABELS: Record<
  StoreShippingSettingsAdminData["mercadoEnviosSource"],
  string
> = {
  admin: "Token Mercado Envíos en admin",
  mp: "Usando token de Mercado Pago (Cobros)",
  env: "Configurado en servidor (variable de entorno)",
  none: "Modo demo (zonas CP)",
};

type AdminShippingSettingsFormProps = {
  initialSettings: StoreShippingSettingsAdminData;
  readOnly?: boolean;
};

export function AdminShippingSettingsForm({
  initialSettings,
  readOnly = false,
}: AdminShippingSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [accessToken, setAccessToken] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    const payload: StoreShippingSettingsSaveInput = {
      ...settings,
      mercadoEnviosAccessToken: accessToken || undefined,
      clearMercadoEnviosToken: clearToken,
    };

    try {
      const response = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        settings?: StoreShippingSettingsAdminData;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar la configuración.");
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      setAccessToken("");
      setClearToken(false);
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
        title="Mercado Envíos"
        description="Token para cotizar envíos reales por API en checkout."
        className="max-w-lg"
      >
        <div className="space-y-3">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            <p>
              Token:{" "}
              <strong className="text-neutral-900">
                {SOURCE_LABELS[settings.mercadoEnviosSource]}
              </strong>
              {" · "}
              Cotización:{" "}
              <strong className="text-neutral-900">
                {settings.mercadoEnviosConfigured
                  ? "API activa"
                  : "Modo demo (zonas CP)"}
              </strong>
            </p>
            {settings.mercadoEnviosTokenHint ? (
              <p className="mt-1 text-neutral-600">
                Guardado:{" "}
                <code className="rounded bg-white px-1 text-xs">
                  {settings.mercadoEnviosTokenHint}
                </code>
              </p>
            ) : null}
            <p className="mt-1 text-xs text-neutral-500">
              Prioridad: admin envíos → Mercado Pago (Cobros) →{" "}
              <code className="rounded bg-white px-1">
                MERCADOENVIOS_ACCESS_TOKEN
              </code>
              .
            </p>
          </div>

          <div>
            <Label htmlFor="mercadoEnviosAccessToken">Access Token</Label>
            <Input
              id="mercadoEnviosAccessToken"
              name="mercadoEnviosAccessToken"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={
                settings.mercadoEnviosSource === "admin"
                  ? "Dejá vacío para mantener el token actual"
                  : "TEST-... o APP_USR-..."
              }
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              className="text-base sm:text-sm"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Mercado Libre → Tus integraciones → Credenciales. El token de
              Cobros suele alcanzar. Se guarda cifrado en el servidor.
            </p>
          </div>

          {settings.mercadoEnviosSource === "admin" ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
              <Switch
                checked={clearToken}
                onChange={(event) => setClearToken(event.target.checked)}
              />
              Quitar token guardado en admin
            </label>
          ) : null}
        </div>
      </AdminCard>

      <AdminCard
        title="Cotización en checkout"
        description="Costo por código postal del comprador al finalizar la compra."
        className="max-w-lg"
      >
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            disabled={readOnly}
            checked={settings.carriersEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                carriersEnabled: event.target.checked,
              }))
            }
          />
          Activar cotización por CP en checkout
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="originZip">CP de origen (depósito)</Label>
            <Input
              id="originZip"
              name="originZip"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="1425"
              disabled={readOnly || !settings.carriersEnabled}
              value={settings.originZip}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  originZip: event.target.value.replace(/\D/g, "").slice(0, 8),
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              Desde dónde despachás. Requerido para cotizar.
            </p>
          </div>

          <div>
            <Label htmlFor="defaultWeightGrams">Peso default por ítem (g)</Label>
            <Input
              id="defaultWeightGrams"
              name="defaultWeightGrams"
              type="number"
              min="100"
              step="50"
              inputMode="numeric"
              disabled={readOnly || !settings.carriersEnabled}
              value={String(settings.defaultWeightGrams)}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  defaultWeightGrams:
                    parseInt(event.target.value, 10) >= 100
                      ? parseInt(event.target.value, 10)
                      : 100,
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              Usado para estimar el paquete (demo y API ML).
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="mercadoLibreQuoteItemId">
              Item MLA de referencia (opcional)
            </Label>
            <Input
              id="mercadoLibreQuoteItemId"
              name="mercadoLibreQuoteItemId"
              placeholder="MLA1234567890"
              disabled={readOnly || !settings.carriersEnabled}
              value={settings.mercadoLibreQuoteItemId}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  mercadoLibreQuoteItemId: event.target.value.trim(),
                }))
              }
              className="text-base sm:text-sm"
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              Publicación Mercado Libre con Mercado Envíos activo. Mejora la
              cotización real si tenés token configurado.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="preferred-carrier">Operador preferido</Label>
            <AdminSelect
              id="preferred-carrier"
              wrapperClassName="mt-1.5"
              value={settings.preferredCarrierId}
              disabled={readOnly || !settings.carriersEnabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  preferredCarrierId: event.target
                    .value as StoreShippingSettingsAdminData["preferredCarrierId"],
                }))
              }
            >
              {SHIPPING_CARRIER_OPTIONS.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.label}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Retiro en local"
        description="Retiro en local siempre es gratis."
        className="max-w-lg"
      >
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              id="allowPickup"
              disabled={readOnly}
              checked={settings.allowPickup}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  allowPickup: event.target.checked,
                }))
              }
            />
            Permitir retiro en local
          </label>
        </div>
      </AdminCard>

      {error ? (
        <div className="max-w-lg">
          <AdminFormAlert variant="error">{error}</AdminFormAlert>
        </div>
      ) : null}
      {saved ? (
        <div className="max-w-lg">
          <AdminFormAlert variant="success">
            Configuración guardada. Los cambios aplican en el checkout al instante.
          </AdminFormAlert>
        </div>
      ) : null}

      <AdminFormActions className="max-w-lg">
        <Button type="submit" disabled={readOnly || loading}>
          {loading ? "Guardando..." : "Guardar envíos"}
        </Button>
      </AdminFormActions>
    </AdminForm>
  );
}
