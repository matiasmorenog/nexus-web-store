import {
  DEFAULT_APP2_COLOR_THEME,
  APP2_COLOR_THEME_IDS,
  type App2ColorThemeId,
} from "@/lib/store-verticals/app2/themes";
import type { StoreVertical } from "@/lib/store-verticals/types";
import type { StoreThemeSettingsData } from "@/lib/premium-themes/types";

export function getDefaultThemeIdForVertical(
  vertical: StoreVertical,
): App2ColorThemeId | "default" {
  if (vertical === "app2") {
    return DEFAULT_APP2_COLOR_THEME;
  }
  return "default";
}

export function normalizeThemeIdForVertical(
  vertical: StoreVertical,
  themeId: string,
): App2ColorThemeId | "default" {
  if (vertical === "app2") {
    if (APP2_COLOR_THEME_IDS.includes(themeId as App2ColorThemeId)) {
      return themeId as App2ColorThemeId;
    }
    return DEFAULT_APP2_COLOR_THEME;
  }

  return "default";
}

export function listThemeOptionsForVertical(vertical: StoreVertical) {
  if (vertical === "app2") {
    return APP2_COLOR_THEME_IDS.map((id) => ({ id, vertical: "app2" as const }));
  }

  return [{ id: "default" as const, vertical: "app1" as const }];
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
