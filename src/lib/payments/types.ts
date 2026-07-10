export type MercadoPagoTokenSource = "admin" | "env" | "none";

export type StorePaymentSettingsAdminData = {
  mercadopagoConfigured: boolean;
  mercadopagoTokenHint: string | null;
  mercadopagoSource: MercadoPagoTokenSource;
};

export type StorePaymentSettingsSaveInput = {
  mercadopagoAccessToken?: string | null;
  clearMercadopagoToken?: boolean;
};
