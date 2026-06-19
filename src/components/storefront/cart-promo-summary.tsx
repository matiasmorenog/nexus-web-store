"use client";

import { formatPrice } from "@/lib/utils";

type CartPromoSummaryProps = {
  rawSubtotal: number;
  promoDiscount: number;
  subtotal: number;
  compact?: boolean;
};

export function CartPromoSummary({
  rawSubtotal,
  promoDiscount,
  subtotal,
  compact = false,
}: CartPromoSummaryProps) {
  if (promoDiscount <= 0) {
    return (
      <div
        className={
          compact
            ? "flex items-baseline justify-between"
            : "flex justify-between text-neutral-600"
        }
      >
        <span className={compact ? "text-sm text-neutral-600" : undefined}>
          Subtotal
        </span>
        <span
          className={
            compact
              ? "text-xl font-bold tracking-tight text-neutral-900"
              : undefined
          }
        >
          {formatPrice(subtotal)}
        </span>
      </div>
    );
  }

  const rowClass = compact
    ? "flex justify-between text-sm"
    : "flex justify-between text-neutral-600";

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className={rowClass}>
        <span>Subtotal</span>
        <span className="text-neutral-400 line-through">
          {formatPrice(rawSubtotal)}
        </span>
      </div>
      <div
        className={
          compact
            ? "flex justify-between text-sm text-[var(--brand-primary)]"
            : "flex justify-between text-[var(--brand-primary)]"
        }
      >
        <span>Promo 2x1</span>
        <span>-{formatPrice(promoDiscount)}</span>
      </div>
      <div
        className={
          compact
            ? "flex items-baseline justify-between"
            : "flex justify-between font-medium text-neutral-900"
        }
      >
        <span className={compact ? "text-sm text-neutral-600" : undefined}>
          {compact ? "Subtotal" : "Subtotal con promo"}
        </span>
        <span
          className={
            compact
              ? "text-xl font-bold tracking-tight text-neutral-900"
              : undefined
          }
        >
          {formatPrice(subtotal)}
        </span>
      </div>
    </div>
  );
}
