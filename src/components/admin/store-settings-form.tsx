"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminForm, AdminFormAlert } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreSettingsFormProps = {
  store: {
    shippingFlatRate: number;
    allowPickup: boolean;
  };
};

export function StoreSettingsForm({ store }: StoreSettingsFormProps) {
  const router = useRouter();
  const [shippingFlatRate, setShippingFlatRate] = useState(
    String(store.shippingFlatRate),
  );
  const [allowPickup, setAllowPickup] = useState(store.allowPickup);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShippingFlatRate(String(store.shippingFlatRate));
    setAllowPickup(store.allowPickup);
  }, [store.allowPickup, store.shippingFlatRate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);

    const formData = new FormData();
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

  return (
    <AdminCard title="Envíos y retiro" className="max-w-lg">
      <AdminForm onSubmit={handleSubmit}>
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
