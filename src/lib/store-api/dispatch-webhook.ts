import { storeHasModule } from "@/lib/modules";
import { signStoreWebhookPayload } from "@/lib/store-api/verify-signature";
import { getActiveStoreWebhookSettings } from "@/lib/store-api/webhooks";

export type StoreWebhookEvent = "order.paid";

export type StoreWebhookPayload = {
  event: StoreWebhookEvent;
  storeId: string;
  occurredAt: string;
  data: Record<string, unknown>;
};

export async function dispatchStoreWebhook(
  storeId: string,
  event: StoreWebhookEvent,
  data: Record<string, unknown>,
): Promise<void> {
  if (!(await storeHasModule(storeId, "api"))) {
    return;
  }

  const settings = await getActiveStoreWebhookSettings(storeId);
  if (!settings.enabled || !settings.url || !settings.secret) {
    return;
  }

  const payload: StoreWebhookPayload = {
    event,
    storeId,
    occurredAt: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);
  const signature = signStoreWebhookPayload(settings.secret, body);

  try {
    await fetch(settings.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Nexus-Event": event,
        "X-Nexus-Signature": signature,
      },
      body,
    });
  } catch (error) {
    console.error("Store webhook dispatch error:", error);
  }
}
