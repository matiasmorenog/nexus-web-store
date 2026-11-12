import type { MercadoEnviosStatus } from "@prisma/client";
import { formatMercadoEnviosDate } from "@/lib/mercado-envios";
import {
  getShippingCarrier,
  isShippingCarrierId,
  type ShippingCarrierId,
} from "@/lib/shipping-carriers/carrier-catalog";

export type OrderShippingInfo = {
  provider: string;
  statusLabel: string;
  detail?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  trackingPortalLabel?: string;
  trackingHint?: string;
  labelUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
  canGenerateShipment?: boolean;
};

type OrderShippingInput = {
  isPickup: boolean;
  shippingCarrierId?: string | null;
  shippingExternalId?: string | null;
  shippingTrackingNumber?: string | null;
  shippingTrackingUrl?: string | null;
  shippingLabelUrl?: string | null;
  shippingCarrierName?: string | null;
  shippingStatus?: string | null;
  shippingEstimatedDelivery?: Date | null;
  /** @deprecated legacy ME columns */
  meShipmentId: string | null;
  meTrackingNumber: string | null;
  meTrackingUrl?: string | null;
  meCarrier: string | null;
  meStatus: MercadoEnviosStatus | null;
  meEstimatedDelivery: Date | null;
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  READY_TO_SHIP: "Etiqueta lista",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
};

function resolveCarrierId(
  shippingCarrierId: string | null | undefined,
  carrierName: string | null | undefined,
): ShippingCarrierId {
  if (shippingCarrierId && isShippingCarrierId(shippingCarrierId)) {
    return shippingCarrierId;
  }
  if (carrierName) {
    const match = (["mercado_envios", "correo_argentino", "andreani"] as const).find(
      (id) => getShippingCarrier(id).label === carrierName.trim(),
    );
    if (match) return match;
  }
  return "mercado_envios";
}

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

  const trackingNumber =
    order.shippingTrackingNumber ?? order.meTrackingNumber;
  const externalId = order.shippingExternalId ?? order.meShipmentId;
  const carrierName = order.shippingCarrierName ?? order.meCarrier;
  const trackingUrl = order.shippingTrackingUrl ?? order.meTrackingUrl;
  const estimatedDelivery =
    order.shippingEstimatedDelivery ?? order.meEstimatedDelivery;
  const statusKey = order.shippingStatus ?? order.meStatus ?? null;
  const carrierId = resolveCarrierId(order.shippingCarrierId, carrierName);
  const carrierMeta = getShippingCarrier(carrierId);

  if (trackingNumber) {
    return {
      provider: carrierMeta.label,
      statusLabel:
        (statusKey && STATUS_LABELS[statusKey]) ||
        statusKey ||
        "En preparación",
      detail: externalId ? `Envío #${externalId}` : undefined,
      trackingNumber,
      trackingUrl: trackingUrl?.trim() || carrierMeta.trackingPortalUrl,
      trackingPortalLabel: carrierMeta.trackingPortalLabel,
      trackingHint: carrierMeta.trackingHint,
      labelUrl: order.shippingLabelUrl ?? undefined,
      carrier: carrierName ?? carrierMeta.label,
      estimatedDelivery: estimatedDelivery
        ? formatMercadoEnviosDate(estimatedDelivery)
        : undefined,
    };
  }

  if (order.status === "PAID" || order.status === "SHIPPED") {
    return {
      provider: carrierMeta.label,
      statusLabel: "Pendiente de despacho",
      detail: "Sin envío generado",
      canGenerateShipment: order.status === "PAID",
    };
  }

  return {
    provider: carrierMeta.label,
    statusLabel: "Sin datos",
  };
}
