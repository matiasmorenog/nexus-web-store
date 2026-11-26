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
import type {
  StoreShippingSettingsSectionSave,
} from "@/lib/shipping-carriers/types";
import type { ShippingCarrierId } from "@/lib/shipping-carriers/carrier-catalog";
import { db } from "@/lib/db";
import { revalidateAdminDashboardCache } from "@/lib/revalidate-admin-cache";
import { STORE_CACHE_TAG } from "@/lib/store-context";

function withCarrierEnabled(
  current: readonly string[] | null | undefined,
  carrierId: ShippingCarrierId,
  enabled: boolean,
  preferredFallback?: string | null,
): ShippingCarrierId[] {
  const base = normalizeEnabledCarrierIds(current, preferredFallback);
  if (enabled) {
    return base.includes(carrierId) ? base : [...base, carrierId];
  }
  return base.filter((id) => id !== carrierId);
}

export async function saveStoreShippingSettingsSection(
  storeId: string,
  input: StoreShippingSettingsSectionSave,
): Promise<void> {
  const existing = await db.storeShippingSettings.findUnique({
    where: { storeId },
  });

  if (input.section === "global") {
    const originZip = input.originZip?.replace(/\D/g, "").slice(0, 8) ?? "";
    if (input.carriersEnabled && originZip.length < 4) {
      throw new Error("Ingresá el CP de origen de la tienda (mínimo 4 dígitos).");
    }
    const enabledCarrierIds = normalizeEnabledCarrierIds(
      existing?.enabledCarrierIds,
      existing?.preferredCarrierId,
    );
    if (input.carriersEnabled && enabledCarrierIds.length === 0) {
      throw new Error(
        "Activá al menos un operador logístico para cotizar en checkout.",
      );
    }
    const defaultWeightGrams =
      typeof input.defaultWeightGrams === "number" &&
      Number.isFinite(input.defaultWeightGrams)
        ? Math.max(100, Math.round(input.defaultWeightGrams))
        : 500;

    await db.storeShippingSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        carriersEnabled: input.carriersEnabled,
        originZip: originZip || null,
        defaultWeightGrams,
        enabledCarrierIds,
        preferredCarrierId: enabledCarrierIds[0] ?? "mercado_envios",
      },
      update: {
        carriersEnabled: input.carriersEnabled,
        originZip: originZip || null,
        defaultWeightGrams,
      },
    });
    revalidateShippingPaths(storeId);
    return;
  }

  if (input.section === "pickup") {
    const pickupAddress = input.pickupAddress?.trim() || null;
    const pickupCity = input.pickupCity?.trim() || null;
    const pickupZip = input.pickupZip?.replace(/\D/g, "").slice(0, 8) || null;
    const pickupNotes = input.pickupNotes?.trim() || null;

    if (input.allowPickup) {
      if (!pickupAddress || pickupAddress.length < 3) {
        throw new Error("Ingresá la dirección del local para retiro.");
      }
      if (!pickupCity || pickupCity.length < 2) {
        throw new Error("Ingresá la ciudad del local para retiro.");
      }
      if (!pickupZip || pickupZip.length < 4) {
        throw new Error(
          "Ingresá el CP del local para retiro (mínimo 4 dígitos).",
        );
      }
    }

    await db.store.update({
      where: { id: storeId },
      data: {
        allowPickup: input.allowPickup,
        pickupAddress,
        pickupCity,
        pickupZip,
        pickupNotes,
      },
    });
    revalidateShippingPaths(storeId);
    return;
  }

  if (input.section === "mercado_envios") {
    const enabledCarrierIds = withCarrierEnabled(
      existing?.enabledCarrierIds,
      "mercado_envios",
      input.enabled,
      existing?.preferredCarrierId,
    );
    if (existing?.carriersEnabled && enabledCarrierIds.length === 0) {
      throw new Error(
        "Activá al menos un operador logístico para cotizar en checkout.",
      );
    }

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
        decryptPaymentSecret(existing.mercadoEnviosAccessTokenEnc) ===
          nextToken;

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

    await db.storeShippingSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        enabledCarrierIds,
        preferredCarrierId: enabledCarrierIds[0] ?? "mercado_envios",
        mercadoLibreQuoteItemId:
          input.mercadoLibreQuoteItemId?.trim() || null,
        ...meTokenUpdate,
      },
      update: {
        enabledCarrierIds,
        preferredCarrierId: enabledCarrierIds[0] ?? existing?.preferredCarrierId,
        mercadoLibreQuoteItemId:
          input.mercadoLibreQuoteItemId?.trim() || null,
        ...meTokenUpdate,
      },
    });
    revalidateShippingPaths(storeId);
    return;
  }

  if (input.section === "correo") {
    const enabledCarrierIds = withCarrierEnabled(
      existing?.enabledCarrierIds,
      "correo_argentino",
      input.enabled,
      existing?.preferredCarrierId,
    );
    if (existing?.carriersEnabled && enabledCarrierIds.length === 0) {
      throw new Error(
        "Activá al menos un operador logístico para cotizar en checkout.",
      );
    }

    const correoCustomerId = input.correoCustomerId?.trim() || null;
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
      if (nextUser && !correoCustomerId) {
        throw new Error("Ingresá el Customer ID de MiCorreo.");
      }
    }

    await db.storeShippingSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        enabledCarrierIds,
        preferredCarrierId: enabledCarrierIds[0] ?? "mercado_envios",
        ...correoUpdate,
      },
      update: {
        enabledCarrierIds,
        preferredCarrierId: enabledCarrierIds[0] ?? existing?.preferredCarrierId,
        ...correoUpdate,
      },
    });
    revalidateShippingPaths(storeId);
    return;
  }

  // andreani
  const enabledCarrierIds = withCarrierEnabled(
    existing?.enabledCarrierIds,
    "andreani",
    input.enabled,
    existing?.preferredCarrierId,
  );
  if (existing?.carriersEnabled && enabledCarrierIds.length === 0) {
    throw new Error(
      "Activá al menos un operador logístico para cotizar en checkout.",
    );
  }

  const andreaniContrato = input.andreaniContrato?.trim() || null;
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
      andreaniUpdate.andreaniClientSecretEnc =
        encryptPaymentSecret(nextSecret);
    }
    if (nextClientId && !andreaniContrato) {
      throw new Error("Ingresá el número de contrato de Andreani.");
    }
  }

  await db.storeShippingSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      enabledCarrierIds,
      preferredCarrierId: enabledCarrierIds[0] ?? "mercado_envios",
      ...andreaniUpdate,
    },
    update: {
      enabledCarrierIds,
      preferredCarrierId: enabledCarrierIds[0] ?? existing?.preferredCarrierId,
      ...andreaniUpdate,
    },
  });
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
