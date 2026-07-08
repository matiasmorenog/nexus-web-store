import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { revalidateAdminDashboardCache } from "@/lib/revalidate-admin-cache";
import {
  decryptPaymentSecret,
  encryptPaymentSecret,
} from "@/lib/payments/encryption";
import {
  getEnvMercadoPagoAccessToken,
  isValidMercadoPagoAccessToken,
  maskMercadoPagoAccessToken,
} from "@/lib/payments/format";
import {
  getMercadoPagoTokenSource,
  resolveMercadoPagoAccessToken,
} from "@/lib/payments/resolve-token";
import type {
  StorePaymentSettingsAdminData,
  StorePaymentSettingsSaveInput,
} from "@/lib/payments/types";

export async function getStorePaymentSettingsForAdmin(
  storeId: string,
): Promise<StorePaymentSettingsAdminData> {
  const row = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      mercadopagoAccessTokenEnc: true,
      mercadopagoTokenHint: true,
    },
  });

  const source = await getMercadoPagoTokenSource(storeId);
  const configured = source !== "none";

  return {
    mercadopagoConfigured: configured,
    mercadopagoTokenHint:
      row?.mercadopagoTokenHint ??
      (source === "env" && getEnvMercadoPagoAccessToken()
        ? maskMercadoPagoAccessToken(getEnvMercadoPagoAccessToken()!)
        : null),
    mercadopagoSource: source,
  };
}

export async function saveStorePaymentSettings(
  storeId: string,
  input: StorePaymentSettingsSaveInput,
): Promise<void> {
  const existing = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: { mercadopagoAccessTokenEnc: true },
  });

  if (input.clearMercadopagoToken) {
    await db.storePaymentSettings.upsert({
      where: { storeId },
      create: { storeId },
      update: {
        mercadopagoAccessTokenEnc: null,
        mercadopagoTokenHint: null,
      },
    });
    revalidatePaymentPaths(storeId);
    return;
  }

  const nextToken = input.mercadopagoAccessToken?.trim() ?? "";
  if (!nextToken) {
    return;
  }

  if (!isValidMercadoPagoAccessToken(nextToken)) {
    throw new Error(
      "El Access Token de Mercado Pago no es válido. Debe comenzar con TEST- o APP_USR-.",
    );
  }

  if (
    existing?.mercadopagoAccessTokenEnc &&
    decryptPaymentSecret(existing.mercadopagoAccessTokenEnc) === nextToken
  ) {
    return;
  }

  await db.storePaymentSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      mercadopagoAccessTokenEnc: encryptPaymentSecret(nextToken),
      mercadopagoTokenHint: maskMercadoPagoAccessToken(nextToken),
    },
    update: {
      mercadopagoAccessTokenEnc: encryptPaymentSecret(nextToken),
      mercadopagoTokenHint: maskMercadoPagoAccessToken(nextToken),
    },
  });

  revalidatePaymentPaths(storeId);
}

function revalidatePaymentPaths(storeId: string) {
  revalidateAdminDashboardCache(storeId);
  revalidatePath("/admin/configuracion");
  revalidatePath("/checkout");
  revalidatePath("/carrito");
}

export async function hasMercadoPagoConfigured(
  storeId: string,
): Promise<boolean> {
  return Boolean(await resolveMercadoPagoAccessToken(storeId));
}
