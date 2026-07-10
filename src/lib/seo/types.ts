export type StoreSeoSettingsData = {
  metaDescription: string;
  ogImageUrl: string;
  robotsIndex: boolean;
  structuredDataEnabled: boolean;
};

export type ResolvedStoreSeoSettings = StoreSeoSettingsData & {
  enabled: true;
};

export type StoreSeoContext = {
  siteUrl: string;
  storeName: string;
  fallbackDescription: string;
};
