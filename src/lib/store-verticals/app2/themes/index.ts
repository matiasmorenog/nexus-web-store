import { cyberTheme } from "@/lib/store-verticals/app2/themes/cyber";
import { tealTheme } from "@/lib/store-verticals/app2/themes/teal";
import type { App2ColorThemeId, App2ThemeDefinition } from "@/lib/store-verticals/app2/themes/types";

export const APP2_COLOR_THEMES: Record<App2ColorThemeId, App2ThemeDefinition> = {
  teal: tealTheme,
  cyber: cyberTheme,
};

export const APP2_COLOR_THEME_IDS = Object.keys(APP2_COLOR_THEMES) as App2ColorThemeId[];

export const DEFAULT_APP2_COLOR_THEME: App2ColorThemeId = "cyber";

export function getApp2Theme(themeId: App2ColorThemeId): App2ThemeDefinition {
  return APP2_COLOR_THEMES[themeId];
}

/** CSS custom properties para aplicar en el storefront app2. */
export function getApp2ThemeCssVars(themeId: App2ColorThemeId): Record<string, string> {
  const { palette: p } = getApp2Theme(themeId);

  return {
    "--brand-primary": p.primary,
    "--brand-primary-dark": p.secondary,
    "--brand-primary-darker": p.background,
    "--brand-primary-mid": p.muted,
    "--brand-primary-light": p.foreground,
    "--brand-primary-accent": p.primary,
    "--brand-promo-accent": p.promo,
    "--brand-primary-soft": `color-mix(in srgb, ${p.primary} 14%, ${p.background})`,
    "--brand-primary-muted": `color-mix(in srgb, ${p.primary} 8%, ${p.muted})`,
    "--brand-primary-subtle": `color-mix(in srgb, ${p.primaryLight} 18%, ${p.background})`,
    "--brand-shadow-sm": `0 2px 8px color-mix(in srgb, ${p.background} 35%, transparent)`,
    "--brand-shadow-md": `0 10px 28px -8px color-mix(in srgb, ${p.background} 45%, transparent)`,
    "--brand-shadow-glow": `0 0 24px ${p.glowPrimary}`,
    "--ui-button-radius": "0.5rem",
    "--ui-button-primary-shadow": `0 0 20px ${p.glowPrimary}, 0 4px 14px color-mix(in srgb, ${p.background} 35%, transparent)`,
    "--ui-button-font-weight": "600",
    "--ui-button-primary-foreground": p.primaryForeground,
    "--storefront-bg": p.background,
    "--jungle-night-sky": p.background,
    "--jungle-night-blue": p.nightBlue,
    "--jungle-moon": p.moon,
    "--jungle-moon-glow": p.moonGlow,
    "--app2-theme-border": p.border,
    "--app2-glow-primary": p.glowPrimary,
    "--app2-glow-promo": p.glowPromo,
    "--app2-text-glow": p.textGlow,
    "--app2-hero-overlay": p.heroOverlay,
    "--app2-muted-foreground": p.mutedForeground,
    "--app2-card-bg": p.card,
  };
}

export type { App2ColorThemeId, App2ThemeDefinition, App2ThemePalette } from "@/lib/store-verticals/app2/themes/types";
