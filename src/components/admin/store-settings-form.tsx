"use client";

import { useState } from "react";
import { updateStoreSettings } from "@/lib/admin-actions";
import { AdminCard } from "@/components/admin/admin-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreSettingsFormProps = {
  store: {
    name: string;
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
        <Label htmlFor="name">Nombre de la tienda</Label>
        <Input id="name" name="name" defaultValue={store.name} required />
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
