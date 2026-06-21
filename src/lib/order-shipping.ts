import type { MercadoEnviosStatus } from "@prisma/client";
import {
  getMercadoEnviosCarrier,
  resolveMercadoEnviosTrackingUrl,
  formatMercadoEnviosDate,
} from "@/lib/mercado-envios";

export type OrderShippingInfo = {
  provider: string;
  statusLabel: string;
  detail?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  trackingPortalLabel?: string;
  trackingHint?: string;
  carrier?: string;
  estimatedDelivery?: string;
};

type OrderShippingInput = {
  isPickup: boolean;
  meShipmentId: string | null;
  meTrackingNumber: string | null;
  meTrackingUrl?: string | null;
  meCarrier: string | null;
  meStatus: MercadoEnviosStatus | null;
  meEstimatedDelivery: Date | null;
  status: string;
};

const ME_STATUS_LABELS: Record<MercadoEnviosStatus, string> = {
  READY_TO_SHIP: "Etiqueta lista",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
};

export function getOrderShippingInfo(
  order: OrderShippingInput,
): OrderShippingInfo {
  if (order.isPickup) {
    return {
      provider: "Retiro en local",
      statusLabel: "Preparar pedido",
      detail: "El cliente retira en el local",
    };
  }

  const provider = "Mercado Envíos";
  const carrierMeta = getMercadoEnviosCarrier();

  if (order.meTrackingNumber && order.meStatus) {
    return {
      provider,
      statusLabel: ME_STATUS_LABELS[order.meStatus],
      detail: order.meShipmentId ? `Envío #${order.meShipmentId}` : undefined,
      trackingNumber: order.meTrackingNumber,
      trackingUrl: resolveMercadoEnviosTrackingUrl({
        trackingUrl: order.meTrackingUrl,
      }),
      trackingPortalLabel: carrierMeta.trackingPortalLabel,
      trackingHint: carrierMeta.trackingHint,
      carrier: order.meCarrier ?? undefined,
      estimatedDelivery: order.meEstimatedDelivery
        ? formatMercadoEnviosDate(order.meEstimatedDelivery)
        : undefined,
    };
  }

  if (order.status === "PAID" || order.status === "SHIPPED") {
    return {
      provider,
      statusLabel: "Pendiente de despacho",
      detail: "Sin envío generado",
    };
  }

  return {
    provider,
    statusLabel: "Sin datos",
  };
}
