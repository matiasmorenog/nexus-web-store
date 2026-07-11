export const TRANSFER_PAYMENT_DISCOUNT_RATE = 0.1;

export function calculateTransferPaymentDiscount(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return Math.round(subtotal * TRANSFER_PAYMENT_DISCOUNT_RATE * 100) / 100;
}

export function transferPaymentDiscountLabel(): string {
  return `${Math.round(TRANSFER_PAYMENT_DISCOUNT_RATE * 100)}%`;
}
