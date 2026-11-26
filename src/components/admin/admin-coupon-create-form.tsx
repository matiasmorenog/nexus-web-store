"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TicketPlus } from "lucide-react";
import { AdminFormAlert, AdminFormGrid } from "@/components/admin/admin-form";
import {
  AdminCommitModal,
  AdminCommitModalBody,
  AdminCommitModalFooter,
  AdminCommitModalHeader,
} from "@/components/ui/admin-commit-modal";
import { Button } from "@/components/ui/button";
import { DatetimeLocalPicker } from "@/components/ui/datetime-local-picker";
import { FormCollapsible } from "@/components/ui/form-collapsible";
import { FormSegmentedControl } from "@/components/ui/form-segmented-control";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { runViewTransition } from "@/lib/view-transition";

const TITLE_ID = "coupon-create-title";

const COUPON_TYPE_OPTIONS = [
  { value: "PERCENTAGE", label: "Porcentaje" },
  { value: "FIXED_AMOUNT", label: "Monto fijo" },
] as const;

function scoreCouponDirty(
  form: HTMLFormElement | null,
  type: "PERCENTAGE" | "FIXED_AMOUNT",
  startsAt: string,
  expiresAt: string,
  activeOnCreate: boolean,
): boolean {
  if (type !== "PERCENTAGE") return true;
  if (!activeOnCreate) return true;
  if (startsAt.trim() || expiresAt.trim()) return true;
  if (!form) return false;
  const data = new FormData(form);
  for (const [key, value] of data.entries()) {
    if (key === "type" || key === "active") continue;
    if (typeof value === "string" && value.trim()) return true;
  }
  return false;
}

export function AdminCouponCreateControls() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [activeOnCreate, setActiveOnCreate] = useState(true);
  const [dirty, setDirty] = useState(false);

  const refreshDirty = useCallback(
    (
      nextType = type,
      nextStarts = startsAt,
      nextExpires = expiresAt,
      nextActive = activeOnCreate,
    ) => {
      setDirty(
        scoreCouponDirty(
          formRef.current,
          nextType,
          nextStarts,
          nextExpires,
          nextActive,
        ),
      );
    },
    [type, startsAt, expiresAt, activeOnCreate],
  );

  const resetAndClose = () => {
    setType("PERCENTAGE");
    setStartsAt("");
    setExpiresAt("");
    setActiveOnCreate(true);
    setError(null);
    setDirty(false);
    setFormKey((key) => key + 1);
    setOpen(false);
  };

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

      resetAndClose();
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
    <>
      <Button
        type="button"
        size="sm"
        className="w-full whitespace-nowrap sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <TicketPlus className="mr-1.5 h-4 w-4" aria-hidden />
        Crear cupón
      </Button>

      <AdminCommitModal
        open={open}
        dirty={dirty}
        onDismiss={resetAndClose}
        labelledBy={TITLE_ID}
        maxWidthClassName="max-w-lg"
      >
        <form
          key={formKey}
          ref={formRef}
          onSubmit={handleSubmit}
          onInput={() => refreshDirty()}
          onChange={() => refreshDirty()}
          className="flex max-h-[min(92dvh,44rem)] flex-col"
        >
          <AdminCommitModalHeader
            titleId={TITLE_ID}
            title="Nuevo cupón"
            description="Código, tipo de descuento y vigencia."
          />
          <AdminCommitModalBody>
            {error ? (
              <AdminFormAlert variant="error">{error}</AdminFormAlert>
            ) : null}
            <AdminFormGrid className="admin-coupon-vt-form">
              <div className="sm:col-span-2">
                <Label htmlFor="coupon-code">Código</Label>
                <Input
                  id="coupon-code"
                  name="code"
                  placeholder="VERANO20"
                  className="uppercase"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="coupon-type">Tipo</Label>
                <FormSegmentedControl
                  id="coupon-type"
                  name="type"
                  className="mt-1.5"
                  value={type}
                  options={COUPON_TYPE_OPTIONS}
                  onChange={(next) => {
                    runViewTransition(() => {
                      setType(next);
                      queueMicrotask(() => refreshDirty(next));
                    });
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
                className="sm:col-span-2"
              >
                <Label htmlFor="coupon-max-discount">
                  Tope de descuento (ARS)
                </Label>
                <Input
                  id="coupon-max-discount"
                  name="maxDiscount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Opcional"
                />
              </FormCollapsible>
              <div className="admin-coupon-vt-usage sm:col-span-2">
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
                className="sm:col-span-2"
              >
                <Label htmlFor="coupon-starts">Vigencia desde</Label>
                <DatetimeLocalPicker
                  id="coupon-starts"
                  name="startsAt"
                  value={startsAt}
                  onChange={(next) => {
                    setStartsAt(next);
                    queueMicrotask(() =>
                      refreshDirty(type, next, expiresAt, activeOnCreate),
                    );
                  }}
                  allowReset
                  aria-label="Vigencia desde"
                />
              </FormCollapsible>
              <div className="admin-coupon-vt-expires sm:col-span-2">
                <Label htmlFor="coupon-expires">Vigencia hasta</Label>
                <DatetimeLocalPicker
                  id="coupon-expires"
                  name="expiresAt"
                  value={expiresAt}
                  onChange={(next) => {
                    setExpiresAt(next);
                    queueMicrotask(() =>
                      refreshDirty(type, startsAt, next, activeOnCreate),
                    );
                  }}
                  min={
                    !activeOnCreate && startsAt
                      ? startsAt.slice(0, 10)
                      : undefined
                  }
                  allowReset
                  aria-label="Vigencia hasta"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700 sm:col-span-2">
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
                      queueMicrotask(() =>
                        refreshDirty(
                          type,
                          next ? "" : startsAt,
                          expiresAt,
                          next,
                        ),
                      );
                    });
                  }}
                />
                Activo al crear
              </label>
            </AdminFormGrid>
          </AdminCommitModalBody>
          <AdminCommitModalFooter>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={resetAndClose}
            >
              Descartar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Guardando…" : "Crear cupón"}
            </Button>
          </AdminCommitModalFooter>
        </form>
      </AdminCommitModal>
    </>
  );
}

/** @deprecated Use AdminCouponCreateControls */
export const AdminCouponCreateForm = AdminCouponCreateControls;
