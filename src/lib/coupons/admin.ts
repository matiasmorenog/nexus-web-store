import type { Coupon } from "@prisma/client";
import type { CouponListItem } from "@/lib/coupons/types";
import { normalizeCouponCode } from "@/lib/coupons/format";

export { normalizeCouponCode };

export function serializeCoupon(coupon: Coupon): CouponListItem {
  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    minOrderAmount: Number(coupon.minOrderAmount),
    maxDiscount: coupon.maxDiscount != null ? Number(coupon.maxDiscount) : null,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    startsAt: coupon.startsAt?.toISOString() ?? null,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    active: coupon.active,
    createdAt: coupon.createdAt.toISOString(),
  };
}

export function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseOptionalDecimal(
  value: FormDataEntryValue | null,
): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}
