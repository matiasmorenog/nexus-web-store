import type { AfipEnvironment, InvoiceStatus } from "@prisma/client";

export type StoreAfipSettingsData = {
  enabled: boolean;
  environment: AfipEnvironment;
  merchantCuit: string | null;
  puntoVenta: number | null;
};

export const DEFAULT_AFIP_SETTINGS: StoreAfipSettingsData = {
  enabled: false,
  environment: "HOMOLOGATION",
  merchantCuit: null,
  puntoVenta: null,
};

export type OrderPaidWebhookItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  sku: string | null;
  product: {
    id: string;
    slug: string;
    name: string;
  };
  variant: {
    id: string;
    size: string;
    color: string;
  };
};

export type OrderPaidWebhookData = {
  orderId: string;
  status: "PAID";
  total: number;
  subtotal: number;
  shippingCost: number;
  promoDiscount: number;
  couponCode: string | null;
  couponDiscount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    taxId: string | null;
  };
  shipping: {
    isPickup: boolean;
    address: string;
    city: string;
    zip: string;
  };
  items: OrderPaidWebhookItem[];
  invoice: {
    status: InvoiceStatus;
  };
};
