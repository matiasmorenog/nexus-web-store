import type { ShippingCarrierId } from "@/lib/shipping-carriers/carrier-catalog";

export type CarrierQuoteInput = {
  storeId: string;
  destinationZip: string;
  originZip: string;
  totalWeightGrams: number;
  itemCount: number;
  orderSubtotal?: number;
  mercadoLibreQuoteItemId?: string | null;
};

export type CarrierQuoteResult = {
  carrierId: ShippingCarrierId;
  carrier: string;
  service: string;
  cost: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  estimatedDelivery: Date;
  /** True only for non-production / sandbox quotes when API marks them as such. */
  sandbox: boolean;
  source: "api" | "fallback";
};

export type CarrierShipmentOrderInput = {
  orderId: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  zip: string;
  totalWeightGrams: number;
  orderSubtotal: number;
  itemCount: number;
};

export type CarrierShipmentResult = {
  carrierId: ShippingCarrierId;
  externalId: string;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl: string | null;
  carrierName: string;
  status: string;
  estimatedDelivery: Date | null;
};

export type ShippingCarrierAdapter = {
  id: ShippingCarrierId;
  label: string;
  isConfigured: (storeId: string) => Promise<boolean>;
  quote: (input: CarrierQuoteInput) => Promise<CarrierQuoteResult>;
  createShipment: (
    input: CarrierShipmentOrderInput,
  ) => Promise<CarrierShipmentResult>;
};
