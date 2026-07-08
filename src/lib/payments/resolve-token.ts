import { db } from "@/lib/db";
import { decryptPaymentSecret } from "@/lib/payments/encryption";
import {
  getEnvMercadoPagoAccessToken,
  isValidMercadoPagoAccessToken,
} from "@/lib/payments/format";
import type { MercadoPagoTokenSource } from "@/lib/payments/types";

async function getStoredMercadoPagoAccessToken(
  storeId: string,
): Promise<string | null> {
  const row = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: { mercadopagoAccessTokenEnc: true },
  });

  if (!row?.mercadopagoAccessTokenEnc) {
    return null;
  }

  try {
    const token = decryptPaymentSecret(row.mercadopagoAccessTokenEnc);
    if (!isValidMercadoPagoAccessToken(token)) {
      return null;
    }

    return token;
  } catch (error) {
    console.error("Failed to decrypt Mercado Pago token:", error);
    return null;
  }
}

export async function resolveMercadoPagoAccessToken(
  storeId: string,
): Promise<string | null> {
  const storedToken = await getStoredMercadoPagoAccessToken(storeId);
  if (storedToken) {
    return storedToken;
  }

  return getEnvMercadoPagoAccessToken();
}

export async function getMercadoPagoTokenSource(
  storeId: string,
): Promise<MercadoPagoTokenSource> {
  const storedToken = await getStoredMercadoPagoAccessToken(storeId);
  if (storedToken) {
    return "admin";
  }

  if (getEnvMercadoPagoAccessToken()) {
    return "env";
  }

  return "none";
}
