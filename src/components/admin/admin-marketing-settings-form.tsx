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
import type { StoreMarketingSettingsData } from "@/lib/marketing";

type AdminMarketingSettingsFormProps = {
  initialSettings: StoreMarketingSettingsData;
};

export function AdminMarketingSettingsForm({
  initialSettings,
}: AdminMarketingSettingsFormProps) {
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
      const response = await fetch("/api/admin/marketing-settings", {
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
        title="WhatsApp"
        description="Botón flotante en el storefront para que los clientes te escriban."
      >
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={settings.whatsappEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                whatsappEnabled: event.target.checked,
              }))
            }
          />
          Activar botón de WhatsApp
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="whatsapp-phone">Teléfono (con código de país)</Label>
            <Input
              id="whatsapp-phone"
              placeholder="5491112345678"
              value={settings.whatsappPhone ?? ""}
              disabled={!settings.whatsappEnabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  whatsappPhone: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="whatsapp-message">Mensaje precargado (opcional)</Label>
            <Input
              id="whatsapp-message"
              placeholder="Hola, quiero consultar por..."
              value={settings.whatsappMessage ?? ""}
              disabled={!settings.whatsappEnabled}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  whatsappMessage: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard
        title="Meta Pixel"
        description="Seguimiento de conversiones. Registra PageView y Purchase al confirmar pedido."
      >
        <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch
            checked={settings.metaPixelEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                metaPixelEnabled: event.target.checked,
              }))
            }
          />
          Activar Meta Pixel
        </label>
        <div className="max-w-md">
          <Label htmlFor="meta-pixel-id">Pixel ID</Label>
          <Input
            id="meta-pixel-id"
            placeholder="123456789012345"
            value={settings.metaPixelId ?? ""}
            disabled={!settings.metaPixelEnabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                metaPixelId: event.target.value,
              }))
            }
          />
        </div>
      </AdminCard>

      {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
      {saved ? (
        <AdminFormAlert variant="success">
          Configuración guardada. Los cambios se verán en la tienda en unos segundos.
        </AdminFormAlert>
      ) : null}

      <AdminFormActions>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar marketing"}
        </Button>
      </AdminFormActions>
    </AdminForm>
  );
}
