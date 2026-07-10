import type { App2ColorThemeId } from "@/lib/store-verticals/app2/themes";

export type StoreThemeSettingsData = {
  themeId: string;
  allowCustomerThemeToggle: boolean;
};

export const DEFAULT_THEME_SETTINGS: StoreThemeSettingsData = {
  themeId: "default",
  allowCustomerThemeToggle: true,
};

export type ResolvedStoreTheme = {
  themeId: App2ColorThemeId | "default";
  allowCustomerThemeToggle: boolean;
  moduleActive: boolean;
};
