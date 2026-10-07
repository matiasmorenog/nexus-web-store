import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { AdminLocale } from "@/lib/admin-locale";
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
import {
  isValidStripeSecretKey,
  isValidStripeWebhookSecret,
  maskStripeSecretKey,
} from "@/lib/payments/stripe-format";
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
      transferDiscountEnabled: true,
      cashEnabled: true,
      stripeEnabled: true,
      stripeSecretKeyHint: true,
      stripeWebhookSecretEnc: true,
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
    transferDiscountEnabled: row?.transferDiscountEnabled ?? true,
    cashEnabled: row?.cashEnabled ?? false,
    stripeEnabled: row?.stripeEnabled ?? false,
    stripeSecretKeyHint: row?.stripeSecretKeyHint ?? null,
    stripeWebhookSecretConfigured: Boolean(row?.stripeWebhookSecretEnc),
  };
}

const STRIPE_ERRORS: Record<AdminLocale, Record<"key" | "webhook" | "missing", string>> = {
  es: {
    key: "La Secret key de Stripe no es válida. Debe comenzar con sk_test_ o sk_live_.",
    webhook: "El signing secret del webhook no es válido. Debe comenzar con whsec_.",
    missing: "Para activar Stripe cargá la Secret key y el signing secret del webhook.",
  },
  it: {
    key: "La Secret key di Stripe non è valida. Deve iniziare con sk_test_ o sk_live_.",
    webhook: "Il signing secret del webhook non è valido. Deve iniziare con whsec_.",
    missing: "Per attivare Stripe inserisci la Secret key e il signing secret del webhook.",
  },
};

function hasStripeInput(input: StorePaymentSettingsSaveInput): boolean {
  return (
    input.stripeEnabled !== undefined ||
    Boolean(input.stripeSecretKey?.trim()) ||
    Boolean(input.stripeWebhookSecret?.trim()) ||
    Boolean(input.clearStripeKeys)
  );
}

async function saveStripeSettings(
  storeId: string,
  input: StorePaymentSettingsSaveInput,
  locale: AdminLocale,
): Promise<void> {
  const errors = STRIPE_ERRORS[locale];

  if (input.clearStripeKeys) {
    await db.storePaymentSettings.upsert({
      where: { storeId },
      create: { storeId },
      update: {
        stripeEnabled: false,
        stripeSecretKeyEnc: null,
        stripeSecretKeyHint: null,
        stripeWebhookSecretEnc: null,
      },
    });
    return;
  }

  const secretKey = input.stripeSecretKey?.trim() ?? "";
  const webhookSecret = input.stripeWebhookSecret?.trim() ?? "";

  if (secretKey && !isValidStripeSecretKey(secretKey)) {
    throw new Error(errors.key);
  }
  if (webhookSecret && !isValidStripeWebhookSecret(webhookSecret)) {
    throw new Error(errors.webhook);
  }

  const existing = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      stripeEnabled: true,
      stripeSecretKeyEnc: true,
      stripeWebhookSecretEnc: true,
    },
  });

  const enabled = input.stripeEnabled ?? existing?.stripeEnabled ?? false;
  const hasKey = Boolean(secretKey || existing?.stripeSecretKeyEnc);
  const hasWebhook = Boolean(webhookSecret || existing?.stripeWebhookSecretEnc);

  if (enabled && (!hasKey || !hasWebhook)) {
    throw new Error(errors.missing);
  }

  const data = {
    stripeEnabled: enabled,
    ...(secretKey
      ? {
          stripeSecretKeyEnc: encryptPaymentSecret(secretKey),
          stripeSecretKeyHint: maskStripeSecretKey(secretKey),
        }
      : {}),
    ...(webhookSecret
      ? { stripeWebhookSecretEnc: encryptPaymentSecret(webhookSecret) }
      : {}),
  };

  await db.storePaymentSettings.upsert({
    where: { storeId },
    create: { storeId, ...data },
    update: data,
  });
}

export async function saveStorePaymentSettings(
  storeId: string,
  input: StorePaymentSettingsSaveInput,
  locale: AdminLocale = "es",
): Promise<void> {
  if (hasStripeInput(input)) {
    await saveStripeSettings(storeId, input, locale);
    revalidatePaymentPaths(storeId);
    return;
  }

  if (input.cashEnabled !== undefined) {
    await db.storePaymentSettings.upsert({
      where: { storeId },
      create: { storeId, cashEnabled: input.cashEnabled },
      update: { cashEnabled: input.cashEnabled },
    });
    revalidatePaymentPaths(storeId);
    return;
  }

  const existing = await db.storePaymentSettings.findUnique({
    where: { storeId },
    select: {
      mercadopagoAccessTokenEnc: true,
      transferEnabled: true,
      transferInstructions: true,
      transferDiscountEnabled: true,
    },
  });

  const transferUpdate =
    input.transferEnabled !== undefined ||
    input.transferInstructions !== undefined ||
    input.transferDiscountEnabled !== undefined
      ? {
          transferEnabled: input.transferEnabled ?? existing?.transferEnabled ?? false,
          transferInstructions:
            input.transferInstructions !== undefined
              ? input.transferInstructions.trim() || null
              : existing?.transferInstructions ?? null,
          transferDiscountEnabled:
            input.transferDiscountEnabled ??
            existing?.transferDiscountEnabled ??
            true,
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
        transferDiscountEnabled: transferUpdate?.transferDiscountEnabled ?? true,
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
        ...transferUpdate,
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
