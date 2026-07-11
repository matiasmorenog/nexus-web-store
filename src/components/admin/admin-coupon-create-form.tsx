"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminFormGrid,
  AdminSelect,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminCouponCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo crear el cupón.");
      }

      event.currentTarget.reset();
      setType("PERCENTAGE");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo crear el cupón.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminCard title="Nuevo cupón">
      <AdminForm onSubmit={handleSubmit}>
        <AdminFormGrid>
          <div>
            <Label htmlFor="coupon-code">Código</Label>
            <Input
              id="coupon-code"
              name="code"
              placeholder="VERANO20"
              className="uppercase"
              required
            />
          </div>
          <div>
            <Label htmlFor="coupon-type">Tipo</Label>
            <AdminSelect
              id="coupon-type"
              name="type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as "PERCENTAGE" | "FIXED_AMOUNT")
              }
            >
              <option value="PERCENTAGE">Porcentaje (%)</option>
              <option value="FIXED_AMOUNT">Monto fijo (ARS)</option>
            </AdminSelect>
          </div>
          <div>
            <Label htmlFor="coupon-value">
              {type === "PERCENTAGE" ? "Porcentaje" : "Monto (ARS)"}
            </Label>
            <Input
              id="coupon-value"
              name="value"
              type="number"
              min="0"
              step={type === "PERCENTAGE" ? "1" : "0.01"}
              max={type === "PERCENTAGE" ? "100" : undefined}
              required
            />
          </div>
          <div>
            <Label htmlFor="coupon-min">Mínimo de compra (ARS)</Label>
            <Input
              id="coupon-min"
              name="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>
          {type === "PERCENTAGE" ? (
            <div>
              <Label htmlFor="coupon-max-discount">Tope de descuento (ARS)</Label>
              <Input
                id="coupon-max-discount"
                name="maxDiscount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Opcional"
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="coupon-usage-limit">Límite de usos</Label>
            <Input
              id="coupon-usage-limit"
              name="usageLimit"
              type="number"
              min="1"
              step="1"
              placeholder="Ilimitado"
            />
          </div>
          <div>
            <Label htmlFor="coupon-starts">Vigencia desde</Label>
            <Input id="coupon-starts" name="startsAt" type="datetime-local" />
          </div>
          <div>
            <Label htmlFor="coupon-expires">Vigencia hasta</Label>
            <Input id="coupon-expires" name="expiresAt" type="datetime-local" />
          </div>
        </AdminFormGrid>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <Switch name="active" defaultChecked />
          Activo al crear
        </label>

        {error ? <AdminFormAlert variant="error">{error}</AdminFormAlert> : null}

        <AdminFormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear cupón"}
          </Button>
        </AdminFormActions>
      </AdminForm>
    </AdminCard>
  );
}
