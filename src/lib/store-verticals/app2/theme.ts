/**
 * Temas de color app2 (Teal + Cyber). Ver `themes/` para paletas exactas del Figma Make.
 */
export {
  DEFAULT_APP2_COLOR_THEME,
  APP2_COLOR_THEME_IDS,
  APP2_COLOR_THEMES,
  getApp2Theme,
  getApp2ThemeCssVars,
  type App2ColorThemeId,
} from "@/lib/store-verticals/app2/themes";

import {
  DEFAULT_APP2_COLOR_THEME,
  getApp2Theme,
  getApp2ThemeCssVars,
} from "@/lib/store-verticals/app2/themes";

/** @deprecated Usar getApp2Theme("cyber").palette — se mantiene para imports legacy. */
export const app2Palette = getApp2Theme(DEFAULT_APP2_COLOR_THEME).palette;

/** Vars CSS del tema por defecto (Cyber) — SSR / config vertical. */
export const app2CssVars = getApp2ThemeCssVars(DEFAULT_APP2_COLOR_THEME);
