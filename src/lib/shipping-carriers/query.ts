import { unstable_cache } from "next/cache";
import type { StoreShippingSettings } from "@prisma/client";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";
import {
  isShippingCarrierId,
  type ShippingCarrierId,
} from "@/lib/shipping-carriers/carrier-catalog";
import {
  loadShippingCredentialsRow,
  resolveAndreaniCredentialsFromRow,
  resolveCorreoCredentialsFromRow,
  resolveMercadoEnviosCredentialsFromRow,
} from "@/lib/shipping-carriers/credentials";
import {
  isMercadoEnviosCarrierId,
  normalizeEnabledCarrierIds,
} from "@/lib/shipping-carriers/format";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type StoreCarrierSettingsData,
  type StoreShippingSettingsAdminData,
} from "@/lib/shipping-carriers/types";
import { STORE_CACHE_TAG } from "@/lib/store-context";

export const SHIPPING_SETTINGS_CACHE_TAG = "shipping-settings";

function serializeCarrierSettings(
  row: StoreShippingSettings | null,
): StoreCarrierSettingsData {
  if (!row) return DEFAULT_SHIPPING_SETTINGS;

  const enabledCarrierIds = normalizeEnabledCarrierIds(
    row.enabledCarrierIds,
    row.preferredCarrierId,
  );
  const preferredCarrierId =
    enabledCarrierIds[0] ??
    (isMercadoEnviosCarrierId(row.preferredCarrierId)
      ? row.preferredCarrierId
      : DEFAULT_SHIPPING_SETTINGS.preferredCarrierId);

  return {
    carriersEnabled: row.carriersEnabled,
    enabledCarrierIds,
    preferredCarrierId,
    originZip: row.originZip?.trim() || DEFAULT_SHIPPING_SETTINGS.originZip,
    mercadoLibreQuoteItemId: row.mercadoLibreQuoteItemId?.trim() ?? "",
    defaultWeightGrams:
      row.defaultWeightGrams > 0
        ? row.defaultWeightGrams
        : DEFAULT_SHIPPING_SETTINGS.defaultWeightGrams,
    correoSandbox: row.correoSandbox ?? true,
    andreaniSandbox: row.andreaniSandbox ?? true,
    correoCustomerId: row.correoCustomerId?.trim() ?? "",
    andreaniContrato: row.andreaniContrato?.trim() ?? "",
  };
}

/**
 * Admin shipping page: one Store round-trip (shipping + payment hints).
 * Neon pooler connection_limit=1 — no Promise.all of separate queries.
 */
export async function getStoreShippingSettingsForAdmin(
  storeId: string,
): Promise<StoreShippingSettingsAdminData> {
  const store = await loadShippingCredentialsRow(storeId);
  const row = store.shippingSettings;
  const me = resolveMercadoEnviosCredentialsFromRow(store);
  const correo = resolveCorreoCredentialsFromRow(store);
  const andreani = resolveAndreaniCredentialsFromRow(store);

  const carrierConfigured: Record<ShippingCarrierId, boolean> = {
    mercado_envios: me.source !== "none",
    correo_argentino: correo.configured,
    andreani: andreani.configured,
  };

  return {
    ...serializeCarrierSettings(row),
    allowPickup: store.allowPickup,
    pickupAddress: store.pickupAddress?.trim() ?? "",
    pickupCity: store.pickupCity?.trim() ?? "",
    pickupZip: store.pickupZip?.trim() ?? "",
    pickupNotes: store.pickupNotes?.trim() ?? "",
    mercadoEnviosConfigured: me.source !== "none",
    mercadoEnviosTokenHint: me.hint,
    mercadoEnviosSource: me.source,
    correoConfigured: correo.configured,
    correoTokenHint: correo.hint,
    andreaniConfigured: andreani.configured,
    andreaniTokenHint: andreani.hint,
    carrierConfigured,
  };
}

export async function getStoreShippingSettings(
  storeId: string,
): Promise<StoreCarrierSettingsData> {
  if (!(await storeHasModule(storeId, "shippingCarriers"))) {
    return {
      ...DEFAULT_SHIPPING_SETTINGS,
      carriersEnabled: false,
      enabledCarrierIds: [],
    };
  }

  const cached = unstable_cache(
    async () => {
      const row = await db.storeShippingSettings.findUnique({
        where: { storeId },
      });
      return serializeCarrierSettings(row);
    },
    [`shipping-settings-${storeId}`],
    {
      tags: [
        SHIPPING_SETTINGS_CACHE_TAG,
        `${SHIPPING_SETTINGS_CACHE_TAG}:${storeId}`,
        STORE_CACHE_TAG,
      ],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  return cached();
}

export async function isCarrierShippingEnabled(storeId: string): Promise<boolean> {
  const settings = await getStoreShippingSettings(storeId);
  if (!settings.carriersEnabled || settings.enabledCarrierIds.length === 0) {
    return false;
  }

  const store = await loadShippingCredentialsRow(storeId);
  const me = resolveMercadoEnviosCredentialsFromRow(store);
  const correo = resolveCorreoCredentialsFromRow(store);
  const andreani = resolveAndreaniCredentialsFromRow(store);

  for (const carrierId of settings.enabledCarrierIds) {
    if (!isShippingCarrierId(carrierId)) continue;
    if (carrierId === "mercado_envios" && me.source !== "none") return true;
    if (carrierId === "correo_argentino" && correo.configured) return true;
    if (carrierId === "andreani" && andreani.configured) return true;
  }
  return false;
}
