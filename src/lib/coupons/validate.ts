import type { Coupon } from "@prisma/client";
import type {
  CouponValidationErrorCode,
  CouponValidationResult,
} from "@/lib/coupons/types";
import { normalizeCouponCode } from "@/lib/coupons/format";

const ERROR_MESSAGES: Record<CouponValidationErrorCode, string> = {
  NOT_FOUND: "El código no existe o no es válido.",
  INACTIVE: "Este cupón no está activo.",
  NOT_STARTED: "Este cupón todavía no está vigente.",
  EXPIRED: "Este cupón ya venció.",
  USAGE_LIMIT: "Este cupón alcanzó el límite de usos.",
  MIN_ORDER: "El subtotal no alcanza el mínimo para este cupón.",
};

function couponInvalid(code: CouponValidationErrorCode): CouponValidationResult {
  return {
    valid: false,
    code,
    message: ERROR_MESSAGES[code],
  };
}

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "type" | "value" | "maxDiscount">,
  orderSubtotal: number,
): number {
  const subtotal = Math.max(0, orderSubtotal);
  const value = Number(coupon.value);

  let discount =
    coupon.type === "PERCENTAGE"
      ? Math.round(subtotal * (value / 100) * 100) / 100
      : value;

  if (coupon.maxDiscount != null && coupon.type === "PERCENTAGE") {
    discount = Math.min(discount, Number(coupon.maxDiscount));
  }

  return Math.min(discount, subtotal);
}

export function validateCouponForCheckout(
  coupon: Coupon | null,
  rawCode: string,
  orderSubtotal: number,
  now = new Date(),
): CouponValidationResult {
  const code = normalizeCouponCode(rawCode);

  if (!code) {
    return couponInvalid("NOT_FOUND");
  }

  if (!coupon || coupon.code !== code) {
    return couponInvalid("NOT_FOUND");
  }

  if (!coupon.active) {
    return couponInvalid("INACTIVE");
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return couponInvalid("NOT_STARTED");
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return couponInvalid("EXPIRED");
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return couponInvalid("USAGE_LIMIT");
  }

  const minOrderAmount = Number(coupon.minOrderAmount);
  if (orderSubtotal < minOrderAmount) {
    return couponInvalid("MIN_ORDER");
  }

  const discount = calculateCouponDiscount(coupon, orderSubtotal);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
    type: coupon.type,
    value: Number(coupon.value),
  };
}
