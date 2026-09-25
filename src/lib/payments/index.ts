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
export {
  getBankingRegion,
  getTransferAdminCopy,
  getTransferStorefrontPaymentCopy,
  usesItalianBanking,
} from "@/lib/payments/transfer-copy";
export { defaultCheckoutPaymentMethod } from "@/lib/payments/default-method";
export type {
  BankingRegion,
  TransferAdminCopy,
  TransferStorefrontPaymentCopy,
} from "@/lib/payments/transfer-copy";
