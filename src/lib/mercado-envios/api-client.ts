import type { MercadoEnviosCarrierId } from "@/lib/mercado-envios/types";

const ML_API_BASE = "https://api.mercadolibre.com";

type MercadoLibreShippingOption = {
  id?: number | string;
  name?: string;
  currency_id?: string;
  cost?: number;
  list_cost?: number;
  display?: string;
  shipping_method_type?: string;
  estimated_delivery_time?: {
    shipping?: number;
    handling?: number;
    date?: string;
  };
};

type MercadoLibreShippingOptionsResponse = {
  options?: MercadoLibreShippingOption[];
  custom_message?: {
    reason?: string;
  };
};

type MercadoLibreUserMe = {
  id: number;
};

export type MercadoLibreQuoteResult = {
  cost: number;
  carrier: string;
  service: string;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  estimatedDelivery: Date;
};

function hoursToBusinessDays(hours: number | undefined, fallback: number) {
  if (!hours || hours <= 0) return fallback;
  return Math.max(1, Math.ceil(hours / 24));
}

function pickShippingOption(
  options: MercadoLibreShippingOption[],
  carrierId: MercadoEnviosCarrierId,
) {
  if (options.length === 0) return null;

  if (carrierId === "correo_argentino") {
    const correo = options.find((option) =>
      /correo argentino/i.test(option.name ?? ""),
    );
    if (correo) return correo;
  }

  const recommended = options.find((option) => option.display === "recommended");
  if (recommended) return recommended;

  const priced = options
    .filter((option) => typeof option.cost === "number" && option.cost >= 0)
    .sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0));

  return priced[0] ?? options[0];
}

function mapOptionToQuote(
  option: MercadoLibreShippingOption,
  carrierId: MercadoEnviosCarrierId,
): MercadoLibreQuoteResult {
  const shippingHours = option.estimated_delivery_time?.shipping ?? 48;
  const handlingHours = option.estimated_delivery_time?.handling ?? 24;
  const daysMin = hoursToBusinessDays(shippingHours, 3);
  const daysMax = hoursToBusinessDays(shippingHours + handlingHours, daysMin + 2);
  const estimatedDelivery = option.estimated_delivery_time?.date
    ? new Date(option.estimated_delivery_time.date)
    : addCalendarDays(new Date(), daysMax);

  const cost = Math.round(option.cost ?? option.list_cost ?? 0);
  const carrierLabel =
    carrierId === "correo_argentino" && /correo/i.test(option.name ?? "")
      ? "Correo Argentino"
      : "Mercado Envíos";

  return {
    cost,
    carrier: carrierLabel,
    service: option.name?.trim() || "Envío a domicilio",
    deliveryDaysMin: daysMin,
    deliveryDaysMax: daysMax,
    estimatedDelivery,
  };
}

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function mercadoLibreFetch<T>(
  path: string,
  accessToken: string,
  searchParams?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${ML_API_BASE}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Mercado Libre API ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }

  return response.json() as Promise<T>;
}

let cachedUserId: { token: string; userId: number } | null = null;

async function getMercadoLibreUserId(accessToken: string) {
  if (cachedUserId?.token === accessToken) {
    return cachedUserId.userId;
  }

  const me = await mercadoLibreFetch<MercadoLibreUserMe>("/users/me", accessToken);
  cachedUserId = { token: accessToken, userId: me.id };
  return me.id;
}

async function fetchItemShippingOptions(
  accessToken: string,
  itemId: string,
  destinationZip: string,
) {
  return mercadoLibreFetch<MercadoLibreShippingOptionsResponse>(
    `/items/${encodeURIComponent(itemId)}/shipping_options`,
    accessToken,
    { zip_code: destinationZip.replace(/\D/g, "") },
  );
}

async function fetchUserShippingOptions(
  accessToken: string,
  userId: number,
  params: {
    destinationZip: string;
    originZip?: string | null;
    dimensions: string;
    itemPrice: number;
  },
) {
  return mercadoLibreFetch<MercadoLibreShippingOptionsResponse>(
    `/users/${userId}/shipping_options/free`,
    accessToken,
    {
      zip_code: params.destinationZip.replace(/\D/g, ""),
      origin_zip_code: params.originZip?.replace(/\D/g, "") ?? undefined,
      dimensions: params.dimensions,
      item_price: Math.max(1, Math.round(params.itemPrice)),
      condition: "new",
      mode: "me2",
      verbose: "true",
    },
  );
}

export function getEnvMercadoEnviosDedicatedAccessToken(): string | null {
  const dedicated = process.env.MERCADOENVIOS_ACCESS_TOKEN?.trim();
  if (dedicated && !dedicated.includes("your-access-token")) {
    return dedicated;
  }

  return null;
}

export function isMercadoEnviosTokenConfigured() {
  if (getEnvMercadoEnviosDedicatedAccessToken()) {
    return true;
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return Boolean(mpToken && !mpToken.includes("your-access-token"));
}

export function getEnvMercadoEnviosAccessToken() {
  const dedicated = getEnvMercadoEnviosDedicatedAccessToken();
  if (dedicated) {
    return dedicated;
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (mpToken && !mpToken.includes("your-access-token")) {
    return mpToken;
  }

  return null;
}

export async function quoteMercadoEnviosFromApi({
  accessToken,
  destinationZip,
  originZip,
  carrierId = "mercado_envios",
  mercadoLibreQuoteItemId,
  totalWeightGrams = 500,
  orderSubtotal = 10000,
}: {
  accessToken: string;
  destinationZip: string;
  originZip?: string | null;
  carrierId?: MercadoEnviosCarrierId;
  mercadoLibreQuoteItemId?: string | null;
  totalWeightGrams?: number;
  orderSubtotal?: number;
}): Promise<MercadoLibreQuoteResult | null> {
  const weight = Math.max(100, Math.round(totalWeightGrams));
  const dimensions = `15x20x10,${weight}`;

  const attempts: Array<Promise<MercadoLibreShippingOptionsResponse>> = [];

  if (mercadoLibreQuoteItemId?.trim()) {
    attempts.push(
      fetchItemShippingOptions(
        accessToken,
        mercadoLibreQuoteItemId.trim(),
        destinationZip,
      ),
    );
  }

  const userId = await getMercadoLibreUserId(accessToken);
  attempts.push(
    fetchUserShippingOptions(accessToken, userId, {
      destinationZip,
      originZip,
      dimensions,
      itemPrice: orderSubtotal,
    }),
  );

  for (const attempt of attempts) {
    try {
      const response = await attempt;
      const option = pickShippingOption(response.options ?? [], carrierId);
      if (!option) continue;
      return mapOptionToQuote(option, carrierId);
    } catch (error) {
      console.warn("Mercado Libre shipping quote attempt failed:", error);
    }
  }

  return null;
}
