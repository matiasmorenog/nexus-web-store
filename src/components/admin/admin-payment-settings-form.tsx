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
import type { StorePaymentSettingsAdminData } from "@/lib/payments";

type AdminPaymentSettingsFormProps = {
  initialSettings: StorePaymentSettingsAdminData;
  readOnly?: boolean;
};

const SOURCE_LABELS: Record<StorePaymentSettingsAdminData["mercadopagoSource"], string> = {
  admin: "Configurado en admin",
  env: "Configurado en servidor (variable de entorno)",
  none: "Modo demo (sin cobros reales)",
};

export function AdminPaymentSettingsForm({
  initialSettings,
  readOnly = false,
}: AdminPaymentSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [accessToken, setAccessToken] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          mercadopagoAccessToken: accessToken || undefined,
          clearMercadopagoToken: clearToken,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        settings?: StorePaymentSettingsAdminData;
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
    <AdminCard
      title="Mercado Pago"
      description="Conectá tu cuenta para cobrar con tarjetas, débito y otros medios en el checkout."
      className="max-w-lg"
    >
      <AdminForm onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <p>
            Estado:{" "}
            <strong className="text-neutral-900">
              {SOURCE_LABELS[settings.mercadopagoSource]}
            </strong>
          </p>
          {settings.mercadopagoTokenHint ? (
            <p className="mt-1 text-neutral-600">
              Token actual:{" "}
              <code className="rounded bg-white px-1 text-xs">
                {settings.mercadopagoTokenHint}
              </code>
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="mercadopagoAccessToken">Access Token</Label>
          <Input
            id="mercadopagoAccessToken"
            name="mercadopagoAccessToken"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              settings.mercadopagoConfigured
                ? "Dejá vacío para mantener el token actual"
                : "TEST-... o APP_USR-..."
            }
            value={accessToken}
            onChange={(event) => setAccessToken(event.target.value)}
            className="text-base sm:text-sm"
            disabled={readOnly}
          />
          <p className="mt-1.5 text-xs text-neutral-500">
            Obtenelo en Mercado Pago → Tus integraciones → Credenciales de
            producción o prueba. Solo se guarda en el servidor, cifrado.
          </p>
        </div>

        {settings.mercadopagoSource === "admin" ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
            <Switch
              checked={clearToken}
              onChange={(event) => setClearToken(event.target.checked)}
              disabled={readOnly}
            />
            Quitar token guardado en admin
          </label>
        ) : null}

        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">
            Configuración de pagos guardada.
          </AdminFormAlert>
        ) : null}

        {readOnly ? (
          <p className="text-sm text-neutral-500">Solo lectura.</p>
        ) : (
          <AdminFormActions>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar pagos"}
            </Button>
          </AdminFormActions>
        )}
      </AdminForm>
    </AdminCard>
  );
}
