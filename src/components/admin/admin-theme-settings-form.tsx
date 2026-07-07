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
import type { StoreThemeSettingsData } from "@/lib/premium-themes";
import {
  getVapeTheme,
  VAPE_COLOR_THEME_IDS,
} from "@/lib/store-verticals/vape/themes";

type AdminThemeSettingsFormProps = {
  initialSettings: StoreThemeSettingsData;
  vertical: "apparel" | "vape";
};

export function AdminThemeSettingsForm({
  initialSettings,
  vertical,
}: AdminThemeSettingsFormProps) {
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
      const response = await fetch("/api/admin/theme-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar el tema.");
      }

      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar el tema.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminForm onSubmit={handleSubmit} className="space-y-6">
      <AdminCard
        title="Tema del storefront"
        description="Elegí la paleta de color que verán tus clientes al entrar a la tienda."
      >
        {vertical === "vape" ? (
          <div className="space-y-3">
            <Label>Tema de color</Label>
            <div className="flex flex-wrap gap-2">
              {VAPE_COLOR_THEME_IDS.map((themeId) => {
                const theme = getVapeTheme(themeId);
                const active = settings.themeId === themeId;

                return (
                  <button
                    key={themeId}
                    type="button"
                    onClick={() =>
                      setSettings((current) => ({ ...current, themeId }))
                    }
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ background: theme.swatch }}
                      aria-hidden
                    />
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            La tienda apparel usa el tema base del deploy. Más variantes visuales
            se agregarán en futuras versiones.
          </p>
        )}

        {vertical === "vape" ? (
          <label className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={settings.allowCustomerThemeToggle}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  allowCustomerThemeToggle: event.target.checked,
                }))
              }
            />
            Permitir que los visitantes cambien el tema desde el header
          </label>
        ) : null}
      </AdminCard>

      {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
      {saved ? (
        <AdminFormAlert variant="success">Tema guardado correctamente.</AdminFormAlert>
      ) : null}

      <AdminFormActions>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar tema"}
        </Button>
      </AdminFormActions>
    </AdminForm>
  );
}
