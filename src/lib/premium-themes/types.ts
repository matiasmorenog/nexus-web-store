import type { VapeColorThemeId } from "@/lib/store-verticals/vape/themes";

export type StoreThemeSettingsData = {
  themeId: string;
  allowCustomerThemeToggle: boolean;
};

export const DEFAULT_THEME_SETTINGS: StoreThemeSettingsData = {
  themeId: "default",
  allowCustomerThemeToggle: true,
};

export type ResolvedStoreTheme = {
  themeId: VapeColorThemeId | "default";
  allowCustomerThemeToggle: boolean;
  moduleActive: boolean;
};
