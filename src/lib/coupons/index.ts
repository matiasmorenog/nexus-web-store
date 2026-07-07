export {
  formatCouponTypeLabel,
  formatCouponValue,
  normalizeCouponCode,
} from "@/lib/coupons/format";
export type {
  CouponListItem,
  CouponValidationErrorCode,
  CouponValidationResult,
} from "@/lib/coupons/types";
export {
  calculateCouponDiscount,
  validateCouponForCheckout,
} from "@/lib/coupons/validate";
