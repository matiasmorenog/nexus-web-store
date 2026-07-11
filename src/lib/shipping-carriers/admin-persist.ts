import { revalidatePath, revalidateTag } from "next/cache";
import {
  decryptPaymentSecret,
  encryptPaymentSecret,
} from "@/lib/payments/encryption";
import {
  isValidMercadoPagoAccessToken,
  maskMercadoPagoAccessToken,
} from "@/lib/payments/format";
import { normalizePreferredCarrierId } from "@/lib/shipping-carriers/format";
import { SHIPPING_SETTINGS_CACHE_TAG } from "@/lib/shipping-carriers/query";
import type { StoreShippingSettingsSaveInput } from "@/lib/shipping-carriers/types";
import { db } from "@/lib/db";
import { revalidateAdminDashboardCache } from "@/lib/revalidate-admin-cache";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export async function saveStoreShippingSettings(
  storeId: string,
  input: StoreShippingSettingsSaveInput,
): Promise<void> {
  const preferredCarrierId = normalizePreferredCarrierId(
    input.preferredCarrierId,
  );

  if (!preferredCarrierId) {
    throw new Error("Seleccioná un operador logístico válido.");
  }

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

  const existing = await db.storeShippingSettings.findUnique({
    where: { storeId },
    select: {
      mercadoEnviosAccessTokenEnc: true,
      carriersEnabled: true,
      preferredCarrierId: true,
      originZip: true,
      mercadoLibreQuoteItemId: true,
      defaultWeightGrams: true,
    },
  });

  const carrierUpdate = {
    carriersEnabled: input.carriersEnabled,
    preferredCarrierId,
    originZip: originZip || null,
    mercadoLibreQuoteItemId,
    defaultWeightGrams,
  };

  if (input.clearMercadoEnviosToken) {
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
        },
        update: {
          ...carrierUpdate,
          mercadoEnviosAccessTokenEnc: null,
          mercadoEnviosTokenHint: null,
        },
      }),
    ]);
    revalidateShippingPaths(storeId);
    return;
  }

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

  const tokenUpdate =
    nextToken && !tokenUnchanged
      ? {
          mercadoEnviosAccessTokenEnc: encryptPaymentSecret(nextToken),
          mercadoEnviosTokenHint: maskMercadoPagoAccessToken(nextToken),
        }
      : {};

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
        ...tokenUpdate,
      },
      update: {
        ...carrierUpdate,
        ...tokenUpdate,
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
  revalidatePath("/admin/modulos/shippingCarriers");
  revalidatePath("/checkout");
}
