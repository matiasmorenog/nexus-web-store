import { db } from "@/lib/db";
import { getCarrierAdapter } from "@/lib/shipping-carriers/adapters";
import { isShippingCarrierId } from "@/lib/shipping-carriers/carrier-catalog";
import {
  getStoreShippingSettings,
  isCarrierShippingEnabled,
} from "@/lib/shipping-carriers/query";

type OrderForShipment = {
  id: string;
  storeId: string;
  isPickup: boolean;
  shippingZip: string;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingCarrierId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  total?: number | null;
  meShipmentId: string | null;
  shippingExternalId?: string | null;
  items?: Array<{ quantity: number }>;
};

export async function createOrderShipment(order: OrderForShipment) {
  if (
    order.isPickup ||
    order.shippingExternalId ||
    order.meShipmentId
  ) {
    return { created: false as const };
  }

  if (!(await isCarrierShippingEnabled(order.storeId))) {
    return { created: false as const };
  }

  const settings = await getStoreShippingSettings(order.storeId);
  const requested = order.shippingCarrierId?.trim() ?? "";
  const carrierId =
    isShippingCarrierId(requested) &&
    settings.enabledCarrierIds.includes(requested)
      ? requested
      : settings.preferredCarrierId;

  if (!isShippingCarrierId(carrierId)) {
    throw new Error("Operador de envío inválido.");
  }

  const adapter = getCarrierAdapter(carrierId);
  const itemCount =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 1;
  const totalWeightGrams = settings.defaultWeightGrams * Math.max(1, itemCount);

  const shipment = await adapter.createShipment({
    orderId: order.id,
    storeId: order.storeId,
    customerName: order.customerName?.trim() || "Cliente",
    customerEmail: order.customerEmail?.trim() || "",
    customerPhone: order.customerPhone?.trim() || "",
    address: order.shippingAddress?.trim() || "",
    city: order.shippingCity?.trim() || "",
    zip: order.shippingZip,
    totalWeightGrams,
    orderSubtotal: Number(order.total ?? 0),
    itemCount,
  });

  await db.order.update({
    where: { id: order.id },
    data: {
      shippingExternalId: shipment.externalId,
      shippingTrackingNumber: shipment.trackingNumber,
      shippingTrackingUrl: shipment.trackingUrl,
      shippingLabelUrl: shipment.labelUrl,
      shippingCarrierName: shipment.carrierName,
      shippingStatus: shipment.status,
      shippingEstimatedDelivery: shipment.estimatedDelivery,
      // Legacy ME columns kept in sync for older UIs/emails.
      meShipmentId: shipment.externalId,
      meTrackingNumber: shipment.trackingNumber,
      meTrackingUrl: shipment.trackingUrl,
      meCarrier: shipment.carrierName,
      meStatus: "READY_TO_SHIP",
      meEstimatedDelivery: shipment.estimatedDelivery,
    },
  });

  return {
    created: true as const,
    shipment,
    autoShipped: false as const,
  };
}
