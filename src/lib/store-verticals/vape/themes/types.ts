export type VapeColorThemeId = "teal" | "cyber";

export type VapeThemePalette = {
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

export type VapeThemeDefinition = {
  id: VapeColorThemeId;
  label: string;
  swatch: string;
  palette: VapeThemePalette;
};
