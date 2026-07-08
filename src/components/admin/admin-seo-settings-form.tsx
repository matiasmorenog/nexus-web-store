"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminTextarea } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreSeoSettingsData } from "@/lib/seo";
import { getStoreSiteUrl } from "@/lib/seo/site-url";

type AdminSeoSettingsFormProps = {
  initialSettings: StoreSeoSettingsData;
};

export function AdminSeoSettingsForm({
  initialSettings,
}: AdminSeoSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const siteUrl = getStoreSiteUrl();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch("/api/admin/seo-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo guardar la configuración SEO.");
      }

      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar la configuración SEO.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminCard
        title="Meta y Open Graph"
        description="Descripción global y imagen para compartir en redes."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="seo-meta-description">Meta description</Label>
            <AdminTextarea
              id="seo-meta-description"
              value={settings.metaDescription}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  metaDescription: event.target.value,
                }))
              }
              rows={4}
              placeholder="Descripción corta de la tienda para Google y redes sociales."
            />
            <p className="text-xs text-neutral-500">
              Recomendado: 120–160 caracteres. Si queda vacío, se usa la descripción del vertical.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-og-image">Imagen Open Graph (URL)</Label>
            <Input
              id="seo-og-image"
              value={settings.ogImageUrl}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  ogImageUrl: event.target.value,
                }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
            <label className="flex items-start gap-3">
              <Switch
                checked={settings.robotsIndex}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    robotsIndex: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  Permitir indexación
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  Controla `robots.txt` y la meta robots del storefront.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <Switch
                checked={settings.structuredDataEnabled}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    structuredDataEnabled: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="block text-sm font-medium text-neutral-900">
                  Structured data (JSON-LD)
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  WebSite en layout y Product en cada PDP.
                </span>
              </span>
            </label>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {saved ? (
            <p className="text-sm text-emerald-600">Configuración guardada.</p>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar SEO"}
          </Button>
        </form>
      </AdminCard>

      <AdminCard
        title="Sitemap y robots"
        description="Generados automáticamente cuando el módulo está activo."
      >
        <div className="space-y-2 text-sm text-neutral-600">
          <p>
            Sitemap:{" "}
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              {siteUrl}/sitemap.xml
            </a>
          </p>
          <p>
            Robots:{" "}
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--brand-primary)] hover:underline"
            >
              {siteUrl}/robots.txt
            </a>
          </p>
        </div>
      </AdminCard>
    </div>
  );
}
