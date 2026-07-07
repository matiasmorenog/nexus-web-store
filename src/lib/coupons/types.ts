export type CouponValidationErrorCode =
  | "NOT_FOUND"
  | "INACTIVE"
  | "NOT_STARTED"
  | "EXPIRED"
  | "USAGE_LIMIT"
  | "MIN_ORDER";

export type CouponValidationResult =
  | {
      valid: true;
      couponId: string;
      code: string;
      discount: number;
      type: "PERCENTAGE" | "FIXED_AMOUNT";
      value: number;
    }
  | {
      valid: false;
      code: CouponValidationErrorCode;
      message: string;
    };

export type CouponListItem = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};
