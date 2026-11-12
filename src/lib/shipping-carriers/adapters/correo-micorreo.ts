import "server-only";

import { getShippingCarrier } from "@/lib/shipping-carriers/carrier-catalog";
import { getCorreoCredentials } from "@/lib/shipping-carriers/credentials";
import type {
  CarrierQuoteInput,
  CarrierQuoteResult,
  CarrierShipmentOrderInput,
  CarrierShipmentResult,
  ShippingCarrierAdapter,
} from "@/lib/shipping-carriers/adapters/types";

const PROD_BASE = "https://api.correoargentino.com.ar/micorreo/v1";
const QA_BASE = "https://apitest.correoargentino.com.ar/micorreo/v1";

type CorreoTokenResponse = { token?: string };
type CorreoRate = {
  deliveredType?: string;
  productType?: string;
  productName?: string;
  price?: number;
};
type CorreoRatesResponse = { rates?: CorreoRate[] };
type CorreoOrderResponse = {
  trackingNumber?: string;
  tracking_number?: string;
  id?: string;
  orderId?: string;
  shippingId?: string;
  labelUrl?: string;
  label_url?: string;
};

async function getCorreoToken(
  user: string,
  password: string,
  sandbox: boolean,
): Promise<string> {
  const base = sandbox ? QA_BASE : PROD_BASE;
  const auth = Buffer.from(`${user}:${password}`).toString("base64");
  const response = await fetch(`${base}/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `MiCorreo auth ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
    );
  }
  const data = (await response.json()) as CorreoTokenResponse;
  if (!data.token) throw new Error("MiCorreo no devolvió token.");
  return data.token;
}

function addBusinessDays(from: Date, days: number) {
  const result = new Date(from);
  let remaining = Math.max(0, days);
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}

export const correoMiCorreoAdapter: ShippingCarrierAdapter = {
  id: "correo_argentino",
  label: getShippingCarrier("correo_argentino").label,

  async isConfigured(storeId) {
    const creds = await getCorreoCredentials(storeId);
    return creds.configured;
  },

  async quote(input: CarrierQuoteInput): Promise<CarrierQuoteResult> {
    const creds = await getCorreoCredentials(input.storeId);
    if (!creds.configured || !creds.user || !creds.password || !creds.customerId) {
      throw new Error("Correo Argentino no está configurado.");
    }

    const token = await getCorreoToken(creds.user, creds.password, creds.sandbox);
    const base = creds.sandbox ? QA_BASE : PROD_BASE;
    const weight = Math.min(
      25000,
      Math.max(1, Math.round(input.totalWeightGrams)),
    );

    const response = await fetch(`${base}/rates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: creds.customerId,
        postalCodeOrigin: input.originZip.replace(/\D/g, ""),
        postalCodeDestination: input.destinationZip.replace(/\D/g, ""),
        deliveredType: "D",
        dimensions: {
          weight,
          height: 10,
          width: 20,
          length: 30,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `MiCorreo rates ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
      );
    }

    const data = (await response.json()) as CorreoRatesResponse;
    const rate =
      data.rates?.find((item) => item.deliveredType === "D") ?? data.rates?.[0];
    if (!rate || typeof rate.price !== "number") {
      throw new Error("MiCorreo no devolvió tarifas para ese CP.");
    }

    const daysMin = 3;
    const daysMax = 7;
    return {
      carrierId: "correo_argentino",
      carrier: getShippingCarrier("correo_argentino").label,
      service: rate.productName?.trim() || "Paq.ar a domicilio",
      cost: Math.round(rate.price),
      deliveryDaysMin: daysMin,
      deliveryDaysMax: daysMax,
      estimatedDelivery: addBusinessDays(new Date(), daysMax),
      sandbox: creds.sandbox,
      source: "api",
    };
  },

  async createShipment(
    input: CarrierShipmentOrderInput,
  ): Promise<CarrierShipmentResult> {
    const creds = await getCorreoCredentials(input.storeId);
    if (!creds.configured || !creds.user || !creds.password || !creds.customerId) {
      throw new Error("Correo Argentino no está configurado.");
    }

    const token = await getCorreoToken(creds.user, creds.password, creds.sandbox);
    const base = creds.sandbox ? QA_BASE : PROD_BASE;
    const meta = getShippingCarrier("correo_argentino");
    const weight = Math.min(
      25000,
      Math.max(1, Math.round(input.totalWeightGrams)),
    );

    // MiCorreo import/create order — body aligned with common PAQ.AR integrations.
    const response = await fetch(`${base}/shipping/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: creds.customerId,
        orderNumber: input.orderId,
        recipient: {
          name: input.customerName,
          email: input.customerEmail,
          phone: input.customerPhone,
          address: input.address,
          city: input.city,
          postalCode: input.zip.replace(/\D/g, ""),
        },
        deliveredType: "D",
        dimensions: {
          weight,
          height: 10,
          width: 20,
          length: 30,
        },
        declaredValue: Math.max(1, Math.round(input.orderSubtotal)),
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      // Fallback endpoint name used by some MiCorreo docs / wrappers.
      const alt = await fetch(`${base}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: creds.customerId,
          externalOrderId: input.orderId,
          deliveryType: "D",
          recipientName: input.customerName,
          recipientEmail: input.customerEmail,
          recipientPhone: input.customerPhone,
          street: input.address,
          city: input.city,
          postalCode: input.zip.replace(/\D/g, ""),
          weight,
          height: 10,
          width: 20,
          length: 30,
        }),
        cache: "no-store",
      });

      if (!alt.ok) {
        const body = await response.text().catch(() => "");
        const altBody = await alt.text().catch(() => "");
        throw new Error(
          `MiCorreo no pudo crear el envío (${response.status}/${alt.status}). ${body || altBody}`.slice(
            0,
            280,
          ),
        );
      }

      const data = (await alt.json()) as CorreoOrderResponse;
      const tracking =
        data.trackingNumber ?? data.tracking_number ?? data.id ?? input.orderId;
      return {
        carrierId: "correo_argentino",
        externalId: String(data.orderId ?? data.shippingId ?? data.id ?? tracking),
        trackingNumber: String(tracking),
        trackingUrl: meta.trackingPortalUrl,
        labelUrl: data.labelUrl ?? data.label_url ?? null,
        carrierName: meta.label,
        status: "READY_TO_SHIP",
        estimatedDelivery: addBusinessDays(new Date(), 7),
      };
    }

    const data = (await response.json()) as CorreoOrderResponse;
    const tracking =
      data.trackingNumber ?? data.tracking_number ?? data.id ?? input.orderId;
    return {
      carrierId: "correo_argentino",
      externalId: String(data.orderId ?? data.shippingId ?? data.id ?? tracking),
      trackingNumber: String(tracking),
      trackingUrl: meta.trackingPortalUrl,
      labelUrl: data.labelUrl ?? data.label_url ?? null,
      carrierName: meta.label,
      status: "READY_TO_SHIP",
      estimatedDelivery: addBusinessDays(new Date(), 7),
    };
  },
};
