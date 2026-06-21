import { db } from "@/lib/db";
import { createMercadoEnviosShipment } from "@/lib/mercado-envios";

type OrderForShipment = {
  id: string;
  isPickup: boolean;
  shippingZip: string;
  meShipmentId: string | null;
};

export async function createOrderShipment(order: OrderForShipment) {
  if (order.isPickup || order.meShipmentId) {
    return { created: false as const };
  }

  const shipment = await createMercadoEnviosShipment({
    orderId: order.id,
    zip: order.shippingZip,
  });

  const autoShipInDemo = shipment.demoMode;

  await db.order.update({
    where: { id: order.id },
    data: {
      meShipmentId: shipment.shipmentId,
      meTrackingNumber: shipment.trackingNumber,
      meTrackingUrl: shipment.trackingUrl,
      meCarrier: shipment.carrier,
      meStatus: shipment.status,
      meEstimatedDelivery: shipment.estimatedDelivery,
      ...(autoShipInDemo ? { status: "SHIPPED" as const } : {}),
    },
  });

  return {
    created: true as const,
    shipment,
    autoShipped: autoShipInDemo,
  };
}
