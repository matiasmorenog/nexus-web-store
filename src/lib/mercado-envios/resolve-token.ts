import { db } from "@/lib/db";
import { getEnvMercadoEnviosDedicatedAccessToken } from "@/lib/mercado-envios/api-client";
import { decryptPaymentSecret } from "@/lib/payments/encryption";
import {
  isValidMercadoPagoAccessToken,
  maskMercadoPagoAccessToken,
} from "@/lib/payments/format";
import { resolveMercadoPagoAccessToken } from "@/lib/payments/resolve-token";
import type { MercadoEnviosTokenSource } from "@/lib/shipping-carriers/types";
import type { MercadoPagoTokenSource } from "@/lib/payments/types";

async function getStoredMercadoEnviosAccessToken(
  storeId: string,
): Promise<string | null> {
  const row = await db.storeShippingSettings.findUnique({
    where: { storeId },
    select: { mercadoEnviosAccessTokenEnc: true },
  });

  if (!row?.mercadoEnviosAccessTokenEnc) {
    return null;
  }

  try {
    const token = decryptPaymentSecret(row.mercadoEnviosAccessTokenEnc);
    if (!isValidMercadoPagoAccessToken(token)) {
      return null;
    }

    return token;
  } catch (error) {
    console.error("Failed to decrypt Mercado Envíos token:", error);
    return null;
  }
}

export async function resolveMercadoEnviosAccessToken(
  storeId: string,
): Promise<string | null> {
  const storedToken = await getStoredMercadoEnviosAccessToken(storeId);
  if (storedToken) {
    return storedToken;
  }

  const mpToken = await resolveMercadoPagoAccessToken(storeId);
  if (mpToken) {
    return mpToken;
  }

  return getEnvMercadoEnviosDedicatedAccessToken();
}

export async function getMercadoEnviosTokenSource(
  storeId: string,
): Promise<MercadoEnviosTokenSource> {
  const storedToken = await getStoredMercadoEnviosAccessToken(storeId);
  if (storedToken) {
    return "admin";
  }

  const mpToken = await resolveMercadoPagoAccessToken(storeId);
  if (mpToken) {
    return "mp";
  }

  if (getEnvMercadoEnviosDedicatedAccessToken()) {
    return "env";
  }

  return "none";
}

/** Admin ME token, or MP token saved in admin (Cobros) when used as fallback. */
export function isMercadoEnviosAdminConfigured(
  source: MercadoEnviosTokenSource,
  mpSource: MercadoPagoTokenSource,
): boolean {
  if (source === "admin") {
    return true;
  }

  return source === "mp" && mpSource === "admin";
}

export async function getMercadoEnviosTokenHintForAdmin(
  storeId: string,
): Promise<string | null> {
  const row = await db.storeShippingSettings.findUnique({
    where: { storeId },
    select: { mercadoEnviosTokenHint: true },
  });

  if (row?.mercadoEnviosTokenHint) {
    return row.mercadoEnviosTokenHint;
  }

  const source = await getMercadoEnviosTokenSource(storeId);
  if (source === "mp") {
    const mpToken = await resolveMercadoPagoAccessToken(storeId);
    return mpToken ? maskMercadoPagoAccessToken(mpToken) : null;
  }

  const envToken = getEnvMercadoEnviosDedicatedAccessToken();
  if (source === "env" && envToken) {
    return maskMercadoPagoAccessToken(envToken);
  }

  return null;
}
