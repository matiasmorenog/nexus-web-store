import "server-only";

import { getShippingCarrier } from "@/lib/shipping-carriers/carrier-catalog";
import { getAndreaniCredentials } from "@/lib/shipping-carriers/credentials";
import type {
  CarrierQuoteInput,
  CarrierQuoteResult,
  CarrierShipmentOrderInput,
  CarrierShipmentResult,
  ShippingCarrierAdapter,
} from "@/lib/shipping-carriers/adapters/types";

const PROD_BASE = "https://apis.andreani.com";
const QA_BASE = "https://apisqa.andreani.com";

type AndreaniTokenResponse = { token?: string; access_token?: string };
type AndreaniTarifaResponse = {
  tarifaConIva?: number;
  tarifaSinIva?: number;
  plazoEntrega?: { minimo?: number; maximo?: number };
};
type AndreaniOrderResponse = {
  estado?: string;
  tipo?: string;
  sucursalDeDistribucion?: { bultos?: Array<{ numeroDeEnvio?: string }> };
  bultos?: Array<{ numeroDeEnvio?: string; linking?: Array<{ meta?: string; contenido?: string }> }>;
  numeroDeEnvio?: string;
  etiqueta?: string;
};

async function getAndreaniToken(
  clientId: string,
  clientSecret: string,
  sandbox: boolean,
): Promise<string> {
  const base = sandbox ? QA_BASE : PROD_BASE;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${base}/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Andreani auth ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
    );
  }
  const data = (await response.json()) as AndreaniTokenResponse;
  const token = data.token ?? data.access_token;
  if (!token) throw new Error("Andreani no devolvió token.");
  return token;
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

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "Cliente";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

export const andreaniAdapter: ShippingCarrierAdapter = {
  id: "andreani",
  label: getShippingCarrier("andreani").label,

  async isConfigured(storeId) {
    const creds = await getAndreaniCredentials(storeId);
    return creds.configured;
  },

  async quote(input: CarrierQuoteInput): Promise<CarrierQuoteResult> {
    const creds = await getAndreaniCredentials(input.storeId);
    if (
      !creds.configured ||
      !creds.clientId ||
      !creds.clientSecret ||
      !creds.contrato
    ) {
      throw new Error("Andreani no está configurado.");
    }

    const token = await getAndreaniToken(
      creds.clientId,
      creds.clientSecret,
      creds.sandbox,
    );
    const base = creds.sandbox ? QA_BASE : PROD_BASE;
    const cpDestino = input.destinationZip.replace(/\D/g, "");
    const url = new URL(`${base}/v1/tarifas`);
    url.searchParams.set("cpDestino", cpDestino);
    url.searchParams.set("contrato", creds.contrato);
    url.searchParams.set("cpOrigen", input.originZip.replace(/\D/g, ""));
    url.searchParams.set(
      "peso",
      String(Math.max(0.1, input.totalWeightGrams / 1000)),
    );

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Andreani tarifas ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}`,
      );
    }

    const data = (await response.json()) as AndreaniTarifaResponse;
    const cost = Math.round(data.tarifaConIva ?? data.tarifaSinIva ?? 0);
    if (!cost || cost <= 0) {
      throw new Error("Andreani no devolvió tarifa para ese CP.");
    }

    const daysMin = Math.max(1, data.plazoEntrega?.minimo ?? 2);
    const daysMax = Math.max(daysMin, data.plazoEntrega?.maximo ?? daysMin + 2);

    return {
      carrierId: "andreani",
      carrier: getShippingCarrier("andreani").label,
      service: "Andreani a domicilio",
      cost,
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
    const creds = await getAndreaniCredentials(input.storeId);
    if (
      !creds.configured ||
      !creds.clientId ||
      !creds.clientSecret ||
      !creds.contrato
    ) {
      throw new Error("Andreani no está configurado.");
    }

    const token = await getAndreaniToken(
      creds.clientId,
      creds.clientSecret,
      creds.sandbox,
    );
    const base = creds.sandbox ? QA_BASE : PROD_BASE;
    const meta = getShippingCarrier("andreani");
    const { firstName, lastName } = splitName(input.customerName);
    const weightKg = Math.max(0.1, input.totalWeightGrams / 1000);

    const createResponse = await fetch(`${base}/v2/ordenes-de-envio`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contrato: creds.contrato,
        origen: {
          postal: {
            codigoPostal: input.zip.replace(/\D/g, ""),
          },
        },
        destino: {
          postal: {
            codigoPostal: input.zip.replace(/\D/g, ""),
            calle: input.address,
            localidad: input.city,
          },
        },
        remitente: {
          nombreCompleto: "Tienda",
        },
        destinatario: {
          nombreCompleto: `${firstName} ${lastName}`,
          eMail: input.customerEmail,
          telefonoMovil: input.customerPhone,
          documentoTipo: "DNI",
          documentoNumero: "00000000",
        },
        bultos: [
          {
            kilos: weightKg,
            volumenCm: 3000,
            valorDeclaradoSinImpuestos: Math.max(1, Math.round(input.orderSubtotal)),
            refererencias: [{ meta: "idCliente", contenido: input.orderId }],
          },
        ],
      }),
      cache: "no-store",
    });

    if (!createResponse.ok) {
      const body = await createResponse.text().catch(() => "");
      throw new Error(
        `Andreani no pudo crear el envío (${createResponse.status}). ${body}`.slice(
          0,
          280,
        ),
      );
    }

    const data = (await createResponse.json()) as AndreaniOrderResponse;
    const tracking =
      data.numeroDeEnvio ??
      data.bultos?.[0]?.numeroDeEnvio ??
      data.sucursalDeDistribucion?.bultos?.[0]?.numeroDeEnvio ??
      input.orderId;

    let labelUrl: string | null = null;
    try {
      const labelResponse = await fetch(
        `${base}/v2/ordenes-de-envio/${encodeURIComponent(String(tracking))}/etiquetas`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
          cache: "no-store",
        },
      );
      if (labelResponse.ok) {
        // Some Andreani envs return a URL in JSON; others stream PDF.
        const contentType = labelResponse.headers.get("content-type") ?? "";
        if (contentType.includes("json")) {
          const labelJson = (await labelResponse.json()) as { pdf?: string; url?: string };
          labelUrl = labelJson.url ?? labelJson.pdf ?? null;
        } else {
          labelUrl = `${meta.trackingPortalUrl}?envio=${encodeURIComponent(String(tracking))}`;
        }
      }
    } catch {
      labelUrl = null;
    }

    return {
      carrierId: "andreani",
      externalId: String(tracking),
      trackingNumber: String(tracking),
      trackingUrl: `${meta.trackingPortalUrl}?numero=${encodeURIComponent(String(tracking))}`,
      labelUrl,
      carrierName: meta.label,
      status: data.estado ?? "READY_TO_SHIP",
      estimatedDelivery: addBusinessDays(new Date(), 5),
    };
  },
};
