export type StoreApiKeySummary = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type StoreWebhookSettingsData = {
  enabled: boolean;
  url: string | null;
  secret: string | null;
};

export const DEFAULT_WEBHOOK_SETTINGS: StoreWebhookSettingsData = {
  enabled: false,
  url: null,
  secret: null,
};

export type CreatedApiKey = {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  createdAt: string;
};
