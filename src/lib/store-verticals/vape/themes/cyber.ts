import type { VapeThemeDefinition } from "@/lib/store-verticals/vape/themes/types";

/** Paleta Cyber — valores exactos del Figma Make (tema VAPORX Cyber). */
export const cyberTheme: VapeThemeDefinition = {
  id: "cyber",
  label: "Cyber",
  swatch: "#00e5ff",
  palette: {
    background: "#08080e",
    foreground: "#f0f0f5",
    card: "#0f0f1a",
    primary: "#00e5ff",
    primaryForeground: "#08080e",
    secondary: "#1a1a2e",
    muted: "#16162a",
    mutedForeground: "#8888aa",
    promo: "#ff6b35",
    border: "rgba(0, 229, 255, 0.12)",
    ring: "#00e5ff",
    glowPrimary: "rgba(0, 229, 255, 0.3)",
    glowPromo: "rgba(255, 107, 53, 0.35)",
    textGlow: "rgba(0, 229, 255, 0.4)",
    heroOverlay: "#08080e",
    nightBlue: "#0f0f1a",
    moon: "#ccefff",
    moonGlow: "#00e5ff",
    primaryLight: "#7aebff",
  },
};
