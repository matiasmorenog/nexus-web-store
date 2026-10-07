export type MercadoPagoTokenSource = "admin" | "env" | "none";

export type StorePaymentSettingsAdminData = {
  mercadopagoConfigured: boolean;
  mercadopagoTokenHint: string | null;
  mercadopagoSource: MercadoPagoTokenSource;
  transferEnabled: boolean;
  transferInstructions: string;
  transferDiscountEnabled: boolean;
  cashEnabled: boolean;
  stripeEnabled: boolean;
  stripeSecretKeyHint: string | null;
  stripeWebhookSecretConfigured: boolean;
};

export type StorePaymentSettingsSaveInput = {
  mercadopagoAccessToken?: string | null;
  clearMercadopagoToken?: boolean;
  transferEnabled?: boolean;
  transferInstructions?: string;
  transferDiscountEnabled?: boolean;
  cashEnabled?: boolean;
  stripeEnabled?: boolean;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  clearStripeKeys?: boolean;
};

export type CheckoutPaymentMethodOption = "mercadopago" | "transfer" | "cash" | "card";

export type CheckoutPaymentConfig = {
  /** Mostrar selector de métodos en checkout (MP, transferencia, efectivo y/o tarjeta). */
  showPaymentMethods: boolean;
  mercadopagoAvailable: boolean;
  transferAvailable: boolean;
  /** Efectivo / contanti — Manoviva (sin Mercado Pago). */
  cashAvailable: boolean;
  /** Tarjeta / wallets vía Stripe Checkout. */
  cardAvailable: boolean;
  transferDiscountPercent: number;
  transferInstructions: string | null;
};
