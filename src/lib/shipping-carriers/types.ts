import type { MercadoEnviosCarrierId } from "@/lib/mercado-envios/types";

export type StoreCarrierSettingsData = {
  carriersEnabled: boolean;
  /** Carriers offered at checkout. Empty = none (hide shipping quotes). */
  enabledCarrierIds: MercadoEnviosCarrierId[];
  /** First enabled carrier (compat / shipment fallback). */
  preferredCarrierId: MercadoEnviosCarrierId;
  originZip: string;
  mercadoLibreQuoteItemId: string;
  defaultWeightGrams: number;
};

export type MercadoEnviosTokenSource = "admin" | "mp" | "env" | "none";

export type StoreShippingSettingsData = StoreCarrierSettingsData & {
  allowPickup: boolean;
};

export type StoreShippingSettingsAdminData = StoreShippingSettingsData & {
  mercadoEnviosConfigured: boolean;
  mercadoEnviosTokenHint: string | null;
  mercadoEnviosSource: MercadoEnviosTokenSource;
};

export type StoreShippingSettingsSaveInput = StoreShippingSettingsData & {
  mercadoEnviosAccessToken?: string | null;
  clearMercadoEnviosToken?: boolean;
};

export const DEFAULT_SHIPPING_SETTINGS: StoreCarrierSettingsData = {
  carriersEnabled: true,
  enabledCarrierIds: ["mercado_envios"],
  preferredCarrierId: "mercado_envios",
  originZip: "1425",
  mercadoLibreQuoteItemId: "",
  defaultWeightGrams: 500,
};

export type ShippingQuoteLineInput = {
  variantId: string;
  quantity: number;
};

export type CheckoutShippingQuoteOption = {
  carrierId: MercadoEnviosCarrierId;
  carrier: string;
  service: string;
  cost: number;
  deliveryWindow: string;
  estimatedDelivery: string;
  demoMode: boolean;
  source: "mercado_libre" | "demo" | "fallback";
};
