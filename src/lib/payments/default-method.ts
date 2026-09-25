import type {
  CheckoutPaymentConfig,
  CheckoutPaymentMethodOption,
} from "@/lib/payments/types";

/** Prefer cash (Manoviva), then transfer-only, else Mercado Pago. */
export function defaultCheckoutPaymentMethod(
  config: CheckoutPaymentConfig,
): CheckoutPaymentMethodOption {
  if (config.cashAvailable) return "cash";
  if (config.transferAvailable && !config.mercadopagoAvailable) return "transfer";
  return "mercadopago";
}
