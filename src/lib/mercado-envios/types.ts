export type MercadoEnviosCarrierId = "mercado_envios" | "correo_argentino";

export type MercadoEnviosQuote = {
  cost: number;
  carrier: string;
  service: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  estimatedDelivery: Date;
  demoMode: boolean;
  source: "mercado_libre" | "demo" | "fallback";
};

export type MercadoEnviosCarrier = {
  id: MercadoEnviosCarrierId;
  label: string;
  trackingPortalUrl: string;
  trackingPortalLabel: string;
  trackingHint: string;
};

export type MercadoEnviosShipment = {
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  carrierId: MercadoEnviosCarrierId;
  status: "READY_TO_SHIP" | "IN_TRANSIT";
  estimatedDelivery: Date;
  trackingUrl: string;
  trackingPortalLabel: string;
  trackingHint: string;
  demoMode: boolean;
};

export type MercadoEnviosQuoteInput = {
  storeId: string;
  destinationZip: string;
  originZip?: string | null;
  carrierId?: MercadoEnviosCarrierId;
  mercadoLibreQuoteItemId?: string | null;
  defaultWeightGrams?: number;
  totalWeightGrams?: number;
  itemCount?: number;
  orderSubtotal?: number;
};
