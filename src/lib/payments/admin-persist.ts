import "server-only";
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
      transferEnabled: true,
      transferInstructions: true,
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
    transferEnabled: row?.transferEnabled ?? false,
    transferInstructions: row?.transferInstructions ?? "",
  };
}

export async function saveStorePaymentSettings(
  storeId: string,
  input: StorePaymentSettingsSaveInput,
): Promise<void> {
  const existing = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      mercadopagoAccessTokenEnc: true,
      transferEnabled: true,
      transferInstructions: true,
    },
  });

  const transferUpdate =
    input.transferEnabled !== undefined ||
    input.transferInstructions !== undefined
      ? {
          transferEnabled: input.transferEnabled ?? existing?.transferEnabled ?? false,
          transferInstructions:
            input.transferInstructions !== undefined
              ? input.transferInstructions.trim() || null
              : existing?.transferInstructions ?? null,
        }
      : null;

  if (input.clearMercadopagoToken) {
    await db.storePaymentSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        ...transferUpdate,
      },
      update: {
        mercadopagoAccessTokenEnc: null,
        mercadopagoTokenHint: null,
        ...transferUpdate,
      },
    });
    revalidatePaymentPaths(storeId);
    return;
  }

  const nextToken = input.mercadopagoAccessToken?.trim() ?? "";
  const tokenUnchanged =
    nextToken &&
    existing?.mercadopagoAccessTokenEnc &&
    decryptPaymentSecret(existing.mercadopagoAccessTokenEnc) === nextToken;

  if (nextToken && !isValidMercadoPagoAccessToken(nextToken)) {
    throw new Error(
      "El Access Token de Mercado Pago no es válido. Debe comenzar con TEST- o APP_USR-.",
    );
  }

  if (!nextToken && !transferUpdate) {
    if (tokenUnchanged) return;
    return;
  }

  if (nextToken && !tokenUnchanged) {
    await db.storePaymentSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        mercadopagoAccessTokenEnc: encryptPaymentSecret(nextToken),
        mercadopagoTokenHint: maskMercadoPagoAccessToken(nextToken),
        transferEnabled: transferUpdate?.transferEnabled ?? false,
        transferInstructions: transferUpdate?.transferInstructions ?? null,
      },
      update: {
        mercadopagoAccessTokenEnc: encryptPaymentSecret(nextToken),
        mercadopagoTokenHint: maskMercadoPagoAccessToken(nextToken),
        ...(transferUpdate ?? {}),
      },
    });
  } else if (transferUpdate) {
    await db.storePaymentSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        transferEnabled: transferUpdate.transferEnabled,
        transferInstructions: transferUpdate.transferInstructions,
      },
      update: transferUpdate,
    });
  }

  revalidatePaymentPaths(storeId);
}

function revalidatePaymentPaths(storeId: string) {
  revalidateAdminDashboardCache(storeId);
  revalidatePath("/admin/modulos/cobros");
  revalidatePath("/checkout");
  revalidatePath("/carrito");
}

export async function hasMercadoPagoConfigured(
  storeId: string,
): Promise<boolean> {
  return Boolean(await resolveMercadoPagoAccessToken(storeId));
}
