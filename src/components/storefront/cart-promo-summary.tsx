"use client";

import { formatPrice } from "@/lib/utils";

type CartPromoSummaryProps = {
  rawSubtotal: number;
  promoDiscount: number;
  subtotal: number;
  transferDiscount?: number;
  couponCode?: string;
  couponDiscount?: number;
  totalAfterDiscounts?: number;
  compact?: boolean;
};

export function CartPromoSummary({
  rawSubtotal,
  promoDiscount,
  subtotal,
  transferDiscount = 0,
  couponCode,
  couponDiscount = 0,
  totalAfterDiscounts,
  compact = false,
}: CartPromoSummaryProps) {
  const finalSubtotal =
    totalAfterDiscounts ?? Math.max(0, subtotal - transferDiscount - couponDiscount);
  const hasPromo = promoDiscount > 0;
  const hasTransfer = transferDiscount > 0;
  const hasCoupon = couponDiscount > 0;

  if (!hasPromo && !hasTransfer && !hasCoupon) {
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
          {formatPrice(finalSubtotal)}
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
      {hasPromo ? (
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
      ) : null}
      {hasTransfer ? (
        <div
          className={
            compact
              ? "flex justify-between text-sm text-[var(--brand-primary)]"
              : "flex justify-between text-[var(--brand-primary)]"
          }
        >
          <span>Transferencia (10% off)</span>
          <span>-{formatPrice(transferDiscount)}</span>
        </div>
      ) : null}
      {hasCoupon ? (
        <div
          className={
            compact
              ? "flex justify-between text-sm text-[var(--brand-primary)]"
              : "flex justify-between text-[var(--brand-primary)]"
          }
        >
          <span>Cupón {couponCode}</span>
          <span>-{formatPrice(couponDiscount)}</span>
        </div>
      ) : null}
      <div
        className={
          compact
            ? "flex items-baseline justify-between"
            : "flex justify-between font-medium text-neutral-900"
        }
      >
        <span className={compact ? "text-sm text-neutral-600" : undefined}>
          {compact ? "Subtotal" : hasCoupon ? "Subtotal con descuentos" : "Subtotal con promo"}
        </span>
        <span
          className={
            compact
              ? "text-xl font-bold tracking-tight text-neutral-900"
              : undefined
          }
        >
          {formatPrice(finalSubtotal)}
        </span>
      </div>
    </div>
  );
}
