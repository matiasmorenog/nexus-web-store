export type StoreMarketingSettingsData = {
  whatsappEnabled: boolean;
  whatsappPhone: string | null;
  whatsappMessage: string | null;
  metaPixelEnabled: boolean;
  metaPixelId: string | null;
};

export const DEFAULT_MARKETING_SETTINGS: StoreMarketingSettingsData = {
  whatsappEnabled: false,
  whatsappPhone: null,
  whatsappMessage: null,
  metaPixelEnabled: false,
  metaPixelId: null,
};
