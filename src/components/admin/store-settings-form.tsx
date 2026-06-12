"use client";

import { useState } from "react";
import { updateStoreSettings } from "@/lib/admin-actions";
import { BRAND_SUFFIX } from "@/lib/brand";
import { AdminCard } from "@/components/admin/admin-card";
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
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    await updateStoreSettings(formData);
    setLoading(false);
    setSaved(true);
  };

  return (
    <AdminCard title="Tienda y envíos" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre de marca</Label>
          <div className="mt-1 flex rounded-lg border border-neutral-200 bg-white focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[var(--brand-primary)] focus-within:ring-offset-1">
            <Input
              id="name"
              name="name"
              defaultValue={store.brandPrefix}
              required
              className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Ej. Alaska"
              aria-describedby="brand-suffix-hint"
            />
            <span
              id="brand-suffix-hint"
              className="flex shrink-0 items-center border-l border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-600"
            >
              {BRAND_SUFFIX}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-neutral-500">
            En el sitio se mostrará como{" "}
            <span className="font-medium text-neutral-700">
              {store.brandPrefix.trim() ? `${store.brandPrefix.trim()} ` : ""}
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
            defaultValue={store.shippingFlatRate}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowPickup"
            name="allowPickup"
            defaultChecked={store.allowPickup}
          />
          <Label htmlFor="allowPickup">Permitir retiro en local</Label>
        </div>
        {saved && <p className="text-sm text-green-600">Configuración guardada</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </AdminCard>
  );
}
