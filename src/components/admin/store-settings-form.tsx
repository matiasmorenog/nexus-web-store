"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND_SUFFIX } from "@/lib/brand";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminForm, AdminFormAlert } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreSettingsFormProps = {
  store: {
    brandPrefix: string;
    shippingFlatRate: number;
    allowPickup: boolean;
  };
};

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const router = useRouter();
  const [brandPrefix, setBrandPrefix] = useState(store.brandPrefix);
  const [shippingFlatRate, setShippingFlatRate] = useState(
    String(store.shippingFlatRate),
  );
  const [allowPickup, setAllowPickup] = useState(store.allowPickup);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBrandPrefix(store.brandPrefix);
    setShippingFlatRate(String(store.shippingFlatRate));
    setAllowPickup(store.allowPickup);
  }, [store.allowPickup, store.brandPrefix, store.shippingFlatRate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    const formData = new FormData();
    formData.set("name", brandPrefix.trim());
    formData.set("shippingFlatRate", shippingFlatRate);
    if (allowPickup) {
      formData.set("allowPickup", "on");
    }

    try {
      const response = await fetch("/api/admin/store-settings", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          data.error ?? "No se pudo guardar la configuración. Intentá de nuevo.",
        );
      }

      setSaved(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo guardar la configuración. Intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const previewPrefix = brandPrefix.trim();

  return (
    <AdminCard title="Tienda y envíos" className="max-w-lg">
      <AdminForm onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Nombre de marca</Label>
          <div className="mt-1 flex min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)] focus-within:ring-offset-1">
            <Input
              id="name"
              name="name"
              value={brandPrefix}
              onChange={(event) => setBrandPrefix(event.target.value)}
              required
              autoComplete="organization"
              enterKeyHint="done"
              className="min-w-0 flex-1 rounded-none border-0 text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm"
              placeholder="Ej. Alaska"
              aria-describedby="brand-suffix-hint"
            />
            <span
              id="brand-suffix-hint"
              className="flex shrink-0 items-center rounded-r-lg border-l border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-600"
            >
              {BRAND_SUFFIX}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            En el sitio se mostrará como{" "}
            <span className="font-medium text-neutral-700">
              {previewPrefix ? `${previewPrefix} ` : ""}
              {BRAND_SUFFIX}
            </span>
            .
          </p>
        </div>
        <div>
          <Label htmlFor="shippingFlatRate">Costo de envío fijo (ARS)</Label>
          <Input
            id="shippingFlatRate"
            name="shippingFlatRate"
            type="number"
            min="0"
            inputMode="numeric"
            value={shippingFlatRate}
            onChange={(event) => setShippingFlatRate(event.target.value)}
            className="text-base sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowPickup"
            name="allowPickup"
            checked={allowPickup}
            onChange={(event) => setAllowPickup(event.target.checked)}
            className="size-4 shrink-0"
          />
          <Label htmlFor="allowPickup">Permitir retiro en local</Label>
        </div>
        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}
        {saved ? (
          <AdminFormAlert variant="success">Configuración guardada</AdminFormAlert>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </AdminForm>
    </AdminCard>
  );
}
