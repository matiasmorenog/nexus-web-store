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

export type CheckoutPaymentMethodOption = "mercadopago" | "transfer";

export type CheckoutPaymentConfig = {
  /** Mostrar selector de métodos en checkout (MP y/o transferencia). */
  showPaymentMethods: boolean;
  mercadopagoAvailable: boolean;
  transferAvailable: boolean;
  transferDiscountPercent: number;
  transferInstructions: string | null;
};
