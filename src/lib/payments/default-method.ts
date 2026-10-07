import type {
  CheckoutPaymentConfig,
  CheckoutPaymentMethodOption,
} from "@/lib/payments/types";

/** Card when Stripe replaces MP (Manoviva), then cash, transfer-only, else Mercado Pago. */
export function defaultCheckoutPaymentMethod(
  config: CheckoutPaymentConfig,
): CheckoutPaymentMethodOption {
  if (config.cardAvailable && !config.mercadopagoAvailable) return "card";
  if (config.cashAvailable) return "cash";
  if (config.transferAvailable && !config.mercadopagoAvailable) return "transfer";
  return "mercadopago";
}
