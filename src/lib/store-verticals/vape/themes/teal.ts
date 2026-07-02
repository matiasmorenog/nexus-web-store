import type { VapeThemeDefinition } from "@/lib/store-verticals/vape/themes/types";

/** Paleta Teal — valores exactos del Figma Make (tema VAPORX Teal). */
export const tealTheme: VapeThemeDefinition = {
  id: "teal",
  label: "Teal",
  swatch: "#2fd8be",
  palette: {
    background: "#08080e",
    foreground: "#ddf2ee",
    card: "#0d1a18",
    primary: "#2fd8be",
    primaryForeground: "#08080e",
    secondary: "#101e1c",
    muted: "#121e1c",
    mutedForeground: "#a8d4cc",
    promo: "#f0b429",
    border: "rgba(47, 216, 190, 0.13)",
    ring: "#2fd8be",
    glowPrimary: "rgba(47, 216, 190, 0.3)",
    glowPromo: "rgba(240, 180, 41, 0.35)",
    textGlow: "rgba(47, 216, 190, 0.4)",
    heroOverlay: "#071e1c",
    nightBlue: "#0d1a18",
    moon: "#a8e6d9",
    moonGlow: "#2fd8be",
    primaryLight: "#5ee4cc",
  },
};
