import type { StoreWebhookSettings } from "@prisma/client";
import {
  DEFAULT_WEBHOOK_SETTINGS,
  type StoreWebhookSettingsData,
} from "@/lib/store-api/types";
import { db } from "@/lib/db";

function serializeSettings(
  row: StoreWebhookSettings | null,
): StoreWebhookSettingsData {
  if (!row) return DEFAULT_WEBHOOK_SETTINGS;

  return {
    enabled: row.enabled,
    url: row.url,
    secret: row.secret,
  };
}

export async function getStoreWebhookSettingsForAdmin(
  storeId: string,
): Promise<StoreWebhookSettingsData> {
  const row = await db.storeWebhookSettings.findUnique({
    where: { storeId },
  });
  return serializeSettings(row);
}

export async function getActiveStoreWebhookSettings(
  storeId: string,
): Promise<StoreWebhookSettingsData> {
  const row = await db.storeWebhookSettings.findUnique({
    where: { storeId },
  });
  const settings = serializeSettings(row);

  if (!settings.enabled || !settings.url?.trim()) {
    return DEFAULT_WEBHOOK_SETTINGS;
  }

  return settings;
}

function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function saveStoreWebhookSettings(
  storeId: string,
  input: StoreWebhookSettingsData,
): Promise<void> {
  const enabled = Boolean(input.enabled);
  let url: string | null = input.url?.trim() || null;
  const secret: string | null = input.secret?.trim() || null;

  if (enabled) {
    if (!url || !isValidWebhookUrl(url)) {
      throw new Error("Ingresá una URL de webhook válida (http o https).");
    }
    if (!secret || secret.length < 8) {
      throw new Error("El secret del webhook debe tener al menos 8 caracteres.");
    }
  } else {
    url = url && isValidWebhookUrl(url) ? url : null;
  }

  await db.storeWebhookSettings.upsert({
    where: { storeId },
    create: {
      storeId,
      enabled,
      url,
      secret,
    },
    update: {
      enabled,
      url,
      secret,
    },
  });
}
