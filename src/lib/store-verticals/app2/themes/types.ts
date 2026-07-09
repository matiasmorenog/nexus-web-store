export type App2ColorThemeId = "teal" | "cyber";

export type App2ThemePalette = {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  muted: string;
  mutedForeground: string;
  promo: string;
  border: string;
  ring: string;
  glowPrimary: string;
  glowPromo: string;
  textGlow: string;
  heroOverlay: string;
  nightBlue: string;
  moon: string;
  moonGlow: string;
  primaryLight: string;
};

export type App2ThemeDefinition = {
  id: App2ColorThemeId;
  label: string;
  swatch: string;
  palette: App2ThemePalette;
};
