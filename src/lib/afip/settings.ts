import type { StoreAfipSettings } from "@prisma/client";
import {
  DEFAULT_AFIP_SETTINGS,
  type StoreAfipSettingsData,
} from "@/lib/afip/types";
import { normalizeTaxId } from "@/lib/afip/tax-id";
import { db } from "@/lib/db";

function serializeSettings(
  row: StoreAfipSettings | null,
): StoreAfipSettingsData {
  if (!row) return DEFAULT_AFIP_SETTINGS;

  return {
    enabled: row.enabled,
    environment: row.environment,
    merchantCuit: row.merchantCuit,
    puntoVenta: row.puntoVenta,
  };
}

export async function getStoreAfipSettingsForAdmin(
  storeId: string,
): Promise<StoreAfipSettingsData> {
  const row = await db.storeAfipSettings.findUnique({
    where: { storeId },
  });
  return serializeSettings(row);
}

export async function getStoreAfipSettings(
  storeId: string,
): Promise<StoreAfipSettingsData> {
  return getStoreAfipSettingsForAdmin(storeId);
}

export async function saveStoreAfipSettings(
  storeId: string,
  input: StoreAfipSettingsData,
): Promise<void> {
  const enabled = Boolean(input.enabled);
  const environment = input.environment === "PRODUCTION" ? "PRODUCTION" : "HOMOLOGATION";

  let merchantCuit: string | null = null;
  let puntoVenta: number | null = null;

  if (enabled) {
    merchantCuit = normalizeTaxId(input.merchantCuit);
    if (!merchantCuit || merchantCuit.length !== 11) {
      throw new Error("Ingresá el CUIT del comercio (11 dígitos).");
    }

    const pv = input.puntoVenta;
    if (pv == null || !Number.isInteger(pv) || pv < 1 || pv > 99999) {
      throw new Error("Ingresá un punto de venta válido (1–99999).");
    }
    puntoVenta = pv;
  } else if (input.merchantCuit?.trim()) {
    merchantCuit = normalizeTaxId(input.merchantCuit);
    if (input.merchantCuit.trim() && !merchantCuit) {
      throw new Error("CUIT del comercio inválido.");
    }
    const pv = input.puntoVenta;
    puntoVenta =
      pv != null && Number.isInteger(pv) && pv >= 1 && pv <= 99999 ? pv : null;
  }

  await db.storeAfipSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      enabled,
      environment,
      merchantCuit,
      puntoVenta,
    },
    update: {
      enabled,
      environment,
      merchantCuit,
      puntoVenta,
    },
  });
}
