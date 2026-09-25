export type MercadoPagoTokenSource = "admin" | "env" | "none";

export type StorePaymentSettingsAdminData = {
  mercadopagoConfigured: boolean;
  mercadopagoTokenHint: string | null;
  mercadopagoSource: MercadoPagoTokenSource;
  transferEnabled: boolean;
  transferInstructions: string;
};

export type StorePaymentSettingsSaveInput = {
  mercadopagoAccessToken?: string | null;
  clearMercadopagoToken?: boolean;
  transferEnabled?: boolean;
  transferInstructions?: string;
};

export type CheckoutPaymentMethodOption = "mercadopago" | "transfer" | "cash";

export type CheckoutPaymentConfig = {
  /** Mostrar selector de métodos en checkout (MP, transferencia y/o efectivo). */
  showPaymentMethods: boolean;
  mercadopagoAvailable: boolean;
  transferAvailable: boolean;
  /** Efectivo / contanti — Manoviva (sin Mercado Pago). */
  cashAvailable: boolean;
  transferDiscountPercent: number;
  transferInstructions: string | null;
};
