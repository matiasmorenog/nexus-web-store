"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/admin-card";
import {
  AdminForm,
  AdminFormActions,
  AdminFormAlert,
  AdminFormGrid,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { DatetimeLocalPicker } from "@/components/ui/datetime-local-picker";
import { FormCollapsible } from "@/components/ui/form-collapsible";
import { FormSegmentedControl } from "@/components/ui/form-segmented-control";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { runViewTransition } from "@/lib/view-transition";

const COUPON_TYPE_OPTIONS = [
  { value: "PERCENTAGE", label: "Porcentaje" },
  { value: "FIXED_AMOUNT", label: "Monto fijo" },
] as const;

export function AdminCouponCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [activeOnCreate, setActiveOnCreate] = useState(true);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    if (activeOnCreate) {
      formData.set("startsAt", "");
    }

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
      setStartsAt("");
      setExpiresAt("");
      setActiveOnCreate(true);
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
        <AdminFormGrid className="admin-coupon-vt-form">
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
            <FormSegmentedControl
              id="coupon-type"
              name="type"
              value={type}
              options={COUPON_TYPE_OPTIONS}
              onChange={(next) => {
                runViewTransition(() => setType(next));
              }}
              aria-label="Tipo de cupón"
            />
          </div>
          <div className="admin-coupon-vt-value">
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
          <FormCollapsible
            open={type === "PERCENTAGE"}
            viewTransitionName="admin-coupon-max"
          >
            <Label htmlFor="coupon-max-discount">Tope de descuento (ARS)</Label>
            <Input
              id="coupon-max-discount"
              name="maxDiscount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Opcional"
            />
          </FormCollapsible>
          <div className="admin-coupon-vt-usage">
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
          <FormCollapsible
            open={!activeOnCreate}
            viewTransitionName="admin-coupon-starts"
          >
            <Label htmlFor="coupon-starts">Vigencia desde</Label>
            <DatetimeLocalPicker
              id="coupon-starts"
              name="startsAt"
              value={startsAt}
              onChange={setStartsAt}
              allowReset
              aria-label="Vigencia desde"
            />
          </FormCollapsible>
          <div className="admin-coupon-vt-expires">
            <Label htmlFor="coupon-expires">Vigencia hasta</Label>
            <DatetimeLocalPicker
              id="coupon-expires"
              name="expiresAt"
              value={expiresAt}
              onChange={setExpiresAt}
              min={
                !activeOnCreate && startsAt
                  ? startsAt.slice(0, 10)
                  : undefined
              }
              allowReset
              aria-label="Vigencia hasta"
            />
          </div>
        </AdminFormGrid>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <input
            type="hidden"
            name="active"
            value={activeOnCreate ? "on" : "off"}
          />
          <Switch
            checked={activeOnCreate}
            onChange={(event) => {
              const next = event.target.checked;
              runViewTransition(() => {
                setActiveOnCreate(next);
                if (next) setStartsAt("");
              });
            }}
          />
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
