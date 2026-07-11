export type {
  CheckoutPaymentConfig,
  CheckoutPaymentMethodOption,
  MercadoPagoTokenSource,
  StorePaymentSettingsAdminData,
  StorePaymentSettingsSaveInput,
} from "@/lib/payments/types";
export {
  calculateTransferPaymentDiscount,
  transferPaymentDiscountLabel,
  TRANSFER_PAYMENT_DISCOUNT_RATE,
} from "@/lib/payments/transfer";
