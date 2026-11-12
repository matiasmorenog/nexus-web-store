export const SHIPPING_CARRIER_IDS = [
  "mercado_envios",
  "correo_argentino",
  "andreani",
] as const;

export type ShippingCarrierId = (typeof SHIPPING_CARRIER_IDS)[number];

export type ShippingCarrierMeta = {
  id: ShippingCarrierId;
  label: string;
  trackingPortalUrl: string;
  trackingPortalLabel: string;
  trackingHint: string;
};

export const SHIPPING_CARRIERS: Record<ShippingCarrierId, ShippingCarrierMeta> =
  {
    mercado_envios: {
      id: "mercado_envios",
      label: "Mercado Envíos",
      trackingPortalUrl: "https://www.mercadolibre.com.ar/ventas/envios",
      trackingPortalLabel: "Rastrear en Mercado Envíos",
      trackingHint:
        "Ingresá con la cuenta de Mercado Libre vinculada a la tienda para ver el envío.",
    },
    correo_argentino: {
      id: "correo_argentino",
      label: "Correo Argentino",
      trackingPortalUrl: "https://www.correoargentino.com.ar/MiCorreo/public/",
      trackingPortalLabel: "Rastrear en MiCorreo",
      trackingHint:
        "Consultá el seguimiento en MiCorreo con el número de tracking del pedido.",
    },
    andreani: {
      id: "andreani",
      label: "Andreani",
      trackingPortalUrl: "https://www.andreani.com/envio/seguimiento",
      trackingPortalLabel: "Rastrear en Andreani",
      trackingHint: "Ingresá el número de seguimiento en el portal de Andreani.",
    },
  };

export function isShippingCarrierId(value: string): value is ShippingCarrierId {
  return (SHIPPING_CARRIER_IDS as readonly string[]).includes(value);
}

export function getShippingCarrier(
  carrierId: ShippingCarrierId,
): ShippingCarrierMeta {
  return SHIPPING_CARRIERS[carrierId];
}
