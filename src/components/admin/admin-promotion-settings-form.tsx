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
import type { StorePromotionSettingsData } from "@/lib/promotions";

type AdminPromotionSettingsFormProps = {
  initialSettings: StorePromotionSettingsData;
};

export function AdminPromotionSettingsForm({
  initialSettings,
}: AdminPromotionSettingsFormProps) {
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
      const response = await fetch("/api/admin/promotion-settings", {
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
        title="Promoción 2x1"
        description="Activa el banner del storefront y el descuento 2x1 en los productos marcados. Con la promoción apagada, el badge y el banner no se muestran y el checkout no aplica el 2x1."
      >
        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">Cambios guardados</AdminFormAlert>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={settings.promo2x1Enabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                promo2x1Enabled: event.target.checked,
              }))
            }
          />
          Activar promoción 2x1
        </label>

        <AdminFormActions>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Guardando..." : "Guardar promoción"}
          </Button>
        </AdminFormActions>
      </AdminCard>
    </AdminForm>
  );
}
