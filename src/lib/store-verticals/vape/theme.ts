/**
 * Temas de color vape (Teal + Cyber). Ver `themes/` para paletas exactas del Figma Make.
 */
export {
  DEFAULT_VAPE_COLOR_THEME,
  VAPE_COLOR_THEME_IDS,
  VAPE_COLOR_THEMES,
  getVapeTheme,
  getVapeThemeCssVars,
  type VapeColorThemeId,
} from "@/lib/store-verticals/vape/themes";

import {
  DEFAULT_VAPE_COLOR_THEME,
  getVapeTheme,
  getVapeThemeCssVars,
} from "@/lib/store-verticals/vape/themes";

/** @deprecated Usar getVapeTheme("cyber").palette — se mantiene para imports legacy. */
export const vapePalette = getVapeTheme(DEFAULT_VAPE_COLOR_THEME).palette;

/** Vars CSS del tema por defecto (Cyber) — SSR / config vertical. */
export const vapeCssVars = getVapeThemeCssVars(DEFAULT_VAPE_COLOR_THEME);
