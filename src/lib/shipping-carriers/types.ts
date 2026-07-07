import type { MercadoEnviosCarrierId } from "@/lib/mercado-envios";

export type StoreShippingSettingsData = {
  carriersEnabled: boolean;
  preferredCarrierId: MercadoEnviosCarrierId;
};

export const DEFAULT_SHIPPING_SETTINGS: StoreShippingSettingsData = {
  carriersEnabled: true,
  preferredCarrierId: "mercado_envios",
};
