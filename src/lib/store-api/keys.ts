import { createHash, randomBytes } from "node:crypto";
import type { CreatedApiKey, StoreApiKeySummary } from "@/lib/store-api/types";
import { db } from "@/lib/db";

const API_KEY_PREFIX = "nws_";

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateRawApiKey(): string {
  const token = randomBytes(24).toString("base64url");
  return `${API_KEY_PREFIX}${token}`;
}

export async function createStoreApiKey(
  storeId: string,
  name: string,
): Promise<CreatedApiKey> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Ingresá un nombre para la clave.");
  }

  const key = generateRawApiKey();
  const keyPrefix = key.slice(0, 12);
  const keyHash = hashApiKey(key);

  const row = await db.storeApiKey.create({
    data: {
      storeId,
      name: trimmedName,
      keyPrefix,
      keyHash,
    },
  });

  return {
    id: row.id,
    name: row.name,
    key,
    keyPrefix: row.keyPrefix,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listStoreApiKeys(
  storeId: string,
): Promise<StoreApiKeySummary[]> {
  const rows = await db.storeApiKey.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    keyPrefix: row.keyPrefix,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  }));
}

export async function revokeStoreApiKey(
  storeId: string,
  apiKeyId: string,
): Promise<void> {
  const row = await db.storeApiKey.findFirst({
    where: { id: apiKeyId, storeId },
  });

  if (!row) {
    throw new Error("Clave no encontrada.");
  }

  await db.storeApiKey.delete({ where: { id: apiKeyId } });
}

export async function authenticateStoreApiKey(
  rawKey: string,
): Promise<{ storeId: string; apiKeyId: string } | null> {
  if (!rawKey.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  const keyHash = hashApiKey(rawKey);
  const row = await db.storeApiKey.findFirst({
    where: { keyHash },
    select: { id: true, storeId: true },
  });

  if (!row) {
    return null;
  }

  await db.storeApiKey.update({
    where: { id: row.id },
    data: { lastUsedAt: new Date() },
  });

  return { storeId: row.storeId, apiKeyId: row.id };
}
