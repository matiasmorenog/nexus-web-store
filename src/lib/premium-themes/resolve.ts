import {
  DEFAULT_VAPE_COLOR_THEME,
  VAPE_COLOR_THEME_IDS,
  type VapeColorThemeId,
} from "@/lib/store-verticals/vape/themes";
import type { StoreVertical } from "@/lib/store-verticals/types";
import type { StoreThemeSettingsData } from "@/lib/premium-themes/types";

export function getDefaultThemeIdForVertical(
  vertical: StoreVertical,
): VapeColorThemeId | "default" {
  if (vertical === "vape") {
    return DEFAULT_VAPE_COLOR_THEME;
  }
  return "default";
}

export function normalizeThemeIdForVertical(
  vertical: StoreVertical,
  themeId: string,
): VapeColorThemeId | "default" {
  if (vertical === "vape") {
    if (VAPE_COLOR_THEME_IDS.includes(themeId as VapeColorThemeId)) {
      return themeId as VapeColorThemeId;
    }
    return DEFAULT_VAPE_COLOR_THEME;
  }

  return "default";
}

export function listThemeOptionsForVertical(vertical: StoreVertical) {
  if (vertical === "vape") {
    return VAPE_COLOR_THEME_IDS.map((id) => ({ id, vertical: "vape" as const }));
  }

  return [{ id: "default" as const, vertical: "apparel" as const }];
}

export function validateThemeSettingsForVertical(
  vertical: StoreVertical,
  input: StoreThemeSettingsData,
): StoreThemeSettingsData {
  return {
    themeId: normalizeThemeIdForVertical(vertical, input.themeId),
    allowCustomerThemeToggle: Boolean(input.allowCustomerThemeToggle),
  };
}
