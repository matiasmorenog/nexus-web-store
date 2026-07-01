import { cyberTheme } from "@/lib/store-verticals/vape/themes/cyber";
import { tealTheme } from "@/lib/store-verticals/vape/themes/teal";
import type { VapeColorThemeId, VapeThemeDefinition } from "@/lib/store-verticals/vape/themes/types";

export const VAPE_COLOR_THEMES: Record<VapeColorThemeId, VapeThemeDefinition> = {
  teal: tealTheme,
  cyber: cyberTheme,
};

export const VAPE_COLOR_THEME_IDS = Object.keys(VAPE_COLOR_THEMES) as VapeColorThemeId[];

export const DEFAULT_VAPE_COLOR_THEME: VapeColorThemeId = "cyber";

export function getVapeTheme(themeId: VapeColorThemeId): VapeThemeDefinition {
  return VAPE_COLOR_THEMES[themeId];
}

/** CSS custom properties para aplicar en el storefront vape. */
export function getVapeThemeCssVars(themeId: VapeColorThemeId): Record<string, string> {
  const { palette: p } = getVapeTheme(themeId);

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
    "--vape-theme-border": p.border,
    "--vape-glow-primary": p.glowPrimary,
    "--vape-glow-promo": p.glowPromo,
    "--vape-text-glow": p.textGlow,
    "--vape-hero-overlay": p.heroOverlay,
    "--vape-muted-foreground": p.mutedForeground,
    "--vape-card-bg": p.card,
  };
}

export type { VapeColorThemeId, VapeThemeDefinition, VapeThemePalette } from "@/lib/store-verticals/vape/themes/types";
