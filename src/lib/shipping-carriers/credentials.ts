import "server-only";

import { db } from "@/lib/db";
import { getEnvMercadoEnviosDedicatedAccessToken } from "@/lib/mercado-envios/api-client";
import { decryptPaymentSecret } from "@/lib/payments/encryption";
import {
  isValidMercadoPagoAccessToken,
  maskMercadoPagoAccessToken,
} from "@/lib/payments/format";
import type { ShippingCarrierId } from "@/lib/shipping-carriers/carrier-catalog";
import type { MercadoEnviosTokenSource } from "@/lib/shipping-carriers/types";

function decryptOptional(enc: string | null | undefined): string | null {
  if (!enc) return null;
  try {
    const value = decryptPaymentSecret(enc).trim();
    return value || null;
  } catch (error) {
    console.error("Failed to decrypt shipping credential:", error);
    return null;
  }
}

export type MercadoEnviosCredentials = {
  accessToken: string | null;
  source: MercadoEnviosTokenSource;
  hint: string | null;
};

export type CorreoCredentials = {
  user: string | null;
  password: string | null;
  customerId: string | null;
  sandbox: boolean;
  hint: string | null;
  configured: boolean;
};

export type AndreaniCredentials = {
  clientId: string | null;
  clientSecret: string | null;
  contrato: string | null;
  sandbox: boolean;
  hint: string | null;
  configured: boolean;
};

export async function loadShippingCredentialsRow(storeId: string) {
  return db.store.findUniqueOrThrow({
    where: { id: storeId },
    select: {
      allowPickup: true,
      pickupAddress: true,
      pickupCity: true,
      pickupZip: true,
      pickupNotes: true,
      shippingSettings: true,
      paymentSettings: {
        select: {
          mercadopagoAccessTokenEnc: true,
          mercadopagoTokenHint: true,
        },
      },
    },
  });
}

export function resolveMercadoEnviosCredentialsFromRow(store: Awaited<
  ReturnType<typeof loadShippingCredentialsRow>
>): MercadoEnviosCredentials {
  const row = store.shippingSettings;
  const meToken = (() => {
    const raw = decryptOptional(row?.mercadoEnviosAccessTokenEnc);
    return raw && isValidMercadoPagoAccessToken(raw) ? raw : null;
  })();
  const mpToken = (() => {
    const raw = decryptOptional(store.paymentSettings?.mercadopagoAccessTokenEnc);
    return raw && isValidMercadoPagoAccessToken(raw) ? raw : null;
  })();
  const envToken = getEnvMercadoEnviosDedicatedAccessToken();
  const envOk =
    envToken && isValidMercadoPagoAccessToken(envToken) ? envToken : null;

  if (meToken) {
    return {
      accessToken: meToken,
      source: "admin",
      hint: row?.mercadoEnviosTokenHint ?? maskMercadoPagoAccessToken(meToken),
    };
  }
  if (mpToken) {
    return {
      accessToken: mpToken,
      source: "mp",
      hint:
        store.paymentSettings?.mercadopagoTokenHint ??
        maskMercadoPagoAccessToken(mpToken),
    };
  }
  if (envOk) {
    return {
      accessToken: envOk,
      source: "env",
      hint: maskMercadoPagoAccessToken(envOk),
    };
  }
  return { accessToken: null, source: "none", hint: null };
}

export function resolveCorreoCredentialsFromRow(store: Awaited<
  ReturnType<typeof loadShippingCredentialsRow>
>): CorreoCredentials {
  const row = store.shippingSettings;
  const user = decryptOptional(row?.correoUserEnc);
  const password = decryptOptional(row?.correoPasswordEnc);
  const customerId = row?.correoCustomerId?.trim() || null;
  const configured = Boolean(user && password && customerId);
  return {
    user,
    password,
    customerId,
    sandbox: row?.correoSandbox ?? true,
    hint: row?.correoTokenHint ?? null,
    configured,
  };
}

export function resolveAndreaniCredentialsFromRow(store: Awaited<
  ReturnType<typeof loadShippingCredentialsRow>
>): AndreaniCredentials {
  const row = store.shippingSettings;
  const clientId = decryptOptional(row?.andreaniClientIdEnc);
  const clientSecret = decryptOptional(row?.andreaniClientSecretEnc);
  const contrato = row?.andreaniContrato?.trim() || null;
  const configured = Boolean(clientId && clientSecret && contrato);
  return {
    clientId,
    clientSecret,
    contrato,
    sandbox: row?.andreaniSandbox ?? true,
    hint: row?.andreaniTokenHint ?? null,
    configured,
  };
}

export async function getMercadoEnviosCredentials(
  storeId: string,
): Promise<MercadoEnviosCredentials> {
  const store = await loadShippingCredentialsRow(storeId);
  return resolveMercadoEnviosCredentialsFromRow(store);
}

export async function getCorreoCredentials(
  storeId: string,
): Promise<CorreoCredentials> {
  const store = await loadShippingCredentialsRow(storeId);
  return resolveCorreoCredentialsFromRow(store);
}

export async function getAndreaniCredentials(
  storeId: string,
): Promise<AndreaniCredentials> {
  const store = await loadShippingCredentialsRow(storeId);
  return resolveAndreaniCredentialsFromRow(store);
}

export async function isCarrierConfigured(
  storeId: string,
  carrierId: ShippingCarrierId,
): Promise<boolean> {
  const store = await loadShippingCredentialsRow(storeId);
  if (carrierId === "mercado_envios") {
    return resolveMercadoEnviosCredentialsFromRow(store).source !== "none";
  }
  if (carrierId === "correo_argentino") {
    return resolveCorreoCredentialsFromRow(store).configured;
  }
  return resolveAndreaniCredentialsFromRow(store).configured;
}

export function maskSecretHint(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}
