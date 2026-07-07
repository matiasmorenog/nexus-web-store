"use client";

import { useState } from "react";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

export type AppliedCheckoutCoupon = {
  code: string;
  couponId: string;
  discount: number;
};

type CheckoutCouponFieldProps = {
  subtotal: number;
  applied: AppliedCheckoutCoupon | null;
  onApplied: (coupon: AppliedCheckoutCoupon | null) => void;
};

export function CheckoutCouponField({
  subtotal,
  applied,
  onApplied,
}: CheckoutCouponFieldProps) {
  const [code, setCode] = useState(applied?.code ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Ingresá un código de cupón.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotal }),
      });
      const data = (await response.json()) as {
        valid?: boolean;
        error?: string;
        code?: string;
        couponId?: string;
        discount?: number;
      };

      if (!response.ok || !data.valid || !data.couponId || data.discount == null) {
        throw new Error(data.error ?? "No se pudo aplicar el cupón.");
      }

      onApplied({
        code: data.code ?? trimmed.toUpperCase(),
        couponId: data.couponId,
        discount: data.discount,
      });
      setCode(data.code ?? trimmed.toUpperCase());
    } catch (applyError) {
      onApplied(null);
      setError(
        applyError instanceof Error
          ? applyError.message
          : "No se pudo aplicar el cupón.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError("");
    onApplied(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
        <Tag className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden />
        Cupón de descuento
      </div>

      {applied ? (
        <div className="flex items-center justify-between gap-3 rounded-md bg-[var(--brand-primary-soft)] px-3 py-2 text-sm">
          <div>
            <p className="font-medium text-neutral-900">{applied.code}</p>
            <p className="text-[var(--brand-primary)]">
              -{formatPrice(applied.discount)}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
            Quitar
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="checkout-coupon" className="sr-only">
              Código de cupón
            </Label>
            <Input
              id="checkout-coupon"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Ej: VERANO20"
              className="uppercase"
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleApply}
          >
            {loading ? "Validando..." : "Aplicar"}
          </Button>
        </div>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
