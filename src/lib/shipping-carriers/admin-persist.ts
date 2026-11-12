import { revalidatePath, revalidateTag } from "next/cache";
import {
  decryptPaymentSecret,
  encryptPaymentSecret,
} from "@/lib/payments/encryption";
import {
  isValidMercadoPagoAccessToken,
  maskMercadoPagoAccessToken,
} from "@/lib/payments/format";
import { normalizeEnabledCarrierIds } from "@/lib/shipping-carriers/format";
import { maskSecretHint } from "@/lib/shipping-carriers/credentials";
import { SHIPPING_SETTINGS_CACHE_TAG } from "@/lib/shipping-carriers/query";
import type { StoreShippingSettingsSaveInput } from "@/lib/shipping-carriers/types";
import { db } from "@/lib/db";
import { revalidateAdminDashboardCache } from "@/lib/revalidate-admin-cache";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export async function saveStoreShippingSettings(
  storeId: string,
  input: StoreShippingSettingsSaveInput,
): Promise<void> {
  const enabledCarrierIds = normalizeEnabledCarrierIds(input.enabledCarrierIds);

  if (input.carriersEnabled && enabledCarrierIds.length === 0) {
    throw new Error("Activá al menos un operador logístico para cotizar en checkout.");
  }

  const preferredCarrierId =
    enabledCarrierIds[0] ?? input.preferredCarrierId ?? "mercado_envios";

  const originZip = input.originZip?.replace(/\D/g, "").slice(0, 8) ?? "";
  if (input.carriersEnabled && originZip.length < 4) {
    throw new Error("Ingresá el CP de origen de la tienda (mínimo 4 dígitos).");
  }

  const defaultWeightGrams =
    typeof input.defaultWeightGrams === "number" &&
    Number.isFinite(input.defaultWeightGrams)
      ? Math.max(100, Math.round(input.defaultWeightGrams))
      : 500;

  const mercadoLibreQuoteItemId = input.mercadoLibreQuoteItemId?.trim() || null;
  const correoCustomerId = input.correoCustomerId?.trim() || null;
  const andreaniContrato = input.andreaniContrato?.trim() || null;

  const existing = await db.storeShippingSettings.findUnique({
    where: { storeId },
    select: {
      mercadoEnviosAccessTokenEnc: true,
      correoUserEnc: true,
      correoPasswordEnc: true,
      andreaniClientIdEnc: true,
      andreaniClientSecretEnc: true,
    },
  });

  const carrierUpdate = {
    carriersEnabled: input.carriersEnabled,
    preferredCarrierId,
    enabledCarrierIds,
    originZip: originZip || null,
    mercadoLibreQuoteItemId,
    defaultWeightGrams,
    correoSandbox: Boolean(input.correoSandbox),
    andreaniSandbox: Boolean(input.andreaniSandbox),
    correoCustomerId,
    andreaniContrato,
  };

  // --- Mercado Envíos token ---
  let meTokenUpdate: Record<string, string | null> = {};
  if (input.clearMercadoEnviosToken) {
    meTokenUpdate = {
      mercadoEnviosAccessTokenEnc: null,
      mercadoEnviosTokenHint: null,
    };
  } else {
    const nextToken = input.mercadoEnviosAccessToken?.trim() ?? "";
    const tokenUnchanged =
      nextToken &&
      existing?.mercadoEnviosAccessTokenEnc &&
      decryptPaymentSecret(existing.mercadoEnviosAccessTokenEnc) === nextToken;

    if (nextToken && !isValidMercadoPagoAccessToken(nextToken)) {
      throw new Error(
        "El Access Token de Mercado Envíos no es válido. Debe comenzar con TEST- o APP_USR-.",
      );
    }

    if (nextToken && !tokenUnchanged) {
      meTokenUpdate = {
        mercadoEnviosAccessTokenEnc: encryptPaymentSecret(nextToken),
        mercadoEnviosTokenHint: maskMercadoPagoAccessToken(nextToken),
      };
    }
  }

  // --- Correo ---
  let correoUpdate: Record<string, string | null | boolean> = {
    correoSandbox: Boolean(input.correoSandbox),
    correoCustomerId,
  };
  if (input.clearCorreoCredentials) {
    correoUpdate = {
      ...correoUpdate,
      correoUserEnc: null,
      correoPasswordEnc: null,
      correoTokenHint: null,
      correoCustomerId: null,
    };
  } else {
    const nextUser = input.correoUser?.trim() ?? "";
    const nextPassword = input.correoPassword?.trim() ?? "";
    if (nextUser) {
      correoUpdate.correoUserEnc = encryptPaymentSecret(nextUser);
      correoUpdate.correoTokenHint = maskSecretHint(nextUser);
    }
    if (nextPassword) {
      correoUpdate.correoPasswordEnc = encryptPaymentSecret(nextPassword);
    }
    if (!correoCustomerId && (nextUser || nextPassword || existing?.correoUserEnc)) {
      // allow keeping customer id from input empty only if clearing — else require when setting new user
      if (nextUser && !correoCustomerId) {
        throw new Error("Ingresá el Customer ID de MiCorreo.");
      }
    }
  }

  // --- Andreani ---
  let andreaniUpdate: Record<string, string | null | boolean> = {
    andreaniSandbox: Boolean(input.andreaniSandbox),
    andreaniContrato,
  };
  if (input.clearAndreaniCredentials) {
    andreaniUpdate = {
      ...andreaniUpdate,
      andreaniClientIdEnc: null,
      andreaniClientSecretEnc: null,
      andreaniTokenHint: null,
      andreaniContrato: null,
    };
  } else {
    const nextClientId = input.andreaniClientId?.trim() ?? "";
    const nextSecret = input.andreaniClientSecret?.trim() ?? "";
    if (nextClientId) {
      andreaniUpdate.andreaniClientIdEnc = encryptPaymentSecret(nextClientId);
      andreaniUpdate.andreaniTokenHint = maskSecretHint(nextClientId);
    }
    if (nextSecret) {
      andreaniUpdate.andreaniClientSecretEnc = encryptPaymentSecret(nextSecret);
    }
    if (nextClientId && !andreaniContrato) {
      throw new Error("Ingresá el número de contrato de Andreani.");
    }
  }

  await db.$transaction([
    db.store.update({
      where: { id: storeId },
      data: {
        allowPickup: input.allowPickup,
      },
    }),
    db.storeShippingSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        ...carrierUpdate,
        ...meTokenUpdate,
        ...correoUpdate,
        ...andreaniUpdate,
      },
      update: {
        ...carrierUpdate,
        ...meTokenUpdate,
        ...correoUpdate,
        ...andreaniUpdate,
      },
    }),
  ]);

  revalidateShippingPaths(storeId);
}

function revalidateShippingPaths(storeId: string) {
  revalidateAdminDashboardCache(storeId);
  revalidateTag(SHIPPING_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(`${SHIPPING_SETTINGS_CACHE_TAG}:${storeId}`, { expire: 0 });
  revalidateTag(STORE_CACHE_TAG, { expire: 0 });
  revalidatePath("/admin/configuracion/envios");
  revalidatePath("/checkout");
}
