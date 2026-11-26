import type { ShippingCarrierId } from "@/lib/shipping-carriers/carrier-catalog";

export type StoreCarrierSettingsData = {
  carriersEnabled: boolean;
  /** Carriers offered at checkout. Empty = none (hide shipping quotes). */
  enabledCarrierIds: ShippingCarrierId[];
  /** First enabled carrier (compat / shipment fallback). */
  preferredCarrierId: ShippingCarrierId;
  originZip: string;
  mercadoLibreQuoteItemId: string;
  defaultWeightGrams: number;
  correoSandbox: boolean;
  andreaniSandbox: boolean;
  correoCustomerId: string;
  andreaniContrato: string;
};

export type MercadoEnviosTokenSource = "admin" | "mp" | "env" | "none";

export type StorePickupLocation = {
  pickupAddress: string;
  pickupCity: string;
  pickupZip: string;
  pickupNotes: string;
};

export type StoreShippingSettingsData = StoreCarrierSettingsData & {
  allowPickup: boolean;
} & StorePickupLocation;

export type StoreShippingSettingsAdminData = StoreShippingSettingsData & {
  mercadoEnviosConfigured: boolean;
  mercadoEnviosTokenHint: string | null;
  mercadoEnviosSource: MercadoEnviosTokenSource;
  correoConfigured: boolean;
  correoTokenHint: string | null;
  andreaniConfigured: boolean;
  andreaniTokenHint: string | null;
  /** Per-carrier: configured enough to quote/create. */
  carrierConfigured: Record<ShippingCarrierId, boolean>;
};

/** Full-form save (legacy). Prefer sectioned payloads from admin cards. */
export type StoreShippingSettingsSaveInput = StoreShippingSettingsData & {
  mercadoEnviosAccessToken?: string | null;
  clearMercadoEnviosToken?: boolean;
  correoUser?: string | null;
  correoPassword?: string | null;
  clearCorreoCredentials?: boolean;
  andreaniClientId?: string | null;
  andreaniClientSecret?: string | null;
  clearAndreaniCredentials?: boolean;
};

/** Per-card admin saves — only the named section is written. */
export type StoreShippingSettingsSectionSave =
  | {
      section: "global";
      carriersEnabled: boolean;
      originZip: string;
      defaultWeightGrams: number;
    }
  | {
      section: "mercado_envios";
      enabled: boolean;
      mercadoLibreQuoteItemId: string;
      mercadoEnviosAccessToken?: string | null;
      clearMercadoEnviosToken?: boolean;
    }
  | {
      section: "correo";
      enabled: boolean;
      correoSandbox: boolean;
      correoCustomerId: string;
      correoUser?: string | null;
      correoPassword?: string | null;
      clearCorreoCredentials?: boolean;
    }
  | {
      section: "andreani";
      enabled: boolean;
      andreaniSandbox: boolean;
      andreaniContrato: string;
      andreaniClientId?: string | null;
      andreaniClientSecret?: string | null;
      clearAndreaniCredentials?: boolean;
    }
  | {
      section: "pickup";
      allowPickup: boolean;
      pickupAddress: string;
      pickupCity: string;
      pickupZip: string;
      pickupNotes: string;
    };

export const DEFAULT_SHIPPING_SETTINGS: StoreCarrierSettingsData = {
  carriersEnabled: true,
  enabledCarrierIds: ["mercado_envios"],
  preferredCarrierId: "mercado_envios",
  originZip: "1425",
  mercadoLibreQuoteItemId: "",
  defaultWeightGrams: 500,
  correoSandbox: true,
  andreaniSandbox: true,
  correoCustomerId: "",
  andreaniContrato: "",
};

export type ShippingQuoteLineInput = {
  variantId: string;
  quantity: number;
};

export type CheckoutShippingQuoteOption = {
  carrierId: ShippingCarrierId;
  carrier: string;
  service: string;
  cost: number;
  deliveryWindow: string;
  estimatedDelivery: string;
  /** @deprecated Prefer sandbox — kept for checkout UI compat. */
  demoMode: boolean;
  sandbox: boolean;
  source: "api" | "fallback" | "mercado_libre" | "demo";
};
