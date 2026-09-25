import { getActiveStoreSlug } from "@/lib/store-env";
import {
  APP1_STORE_SLUG,
  APP2_STORE_SLUG,
  APP3_STORE_SLUG,
} from "@/lib/store-slugs";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_PATH = "/opengraph-image";

export type OgBrandVisual = {
  alt: string;
  background: string;
  foreground: string;
  accent: string;
  title: string;
  subtitle: string;
  kind: "app1" | "app2" | "app3";
};

const OG_BRAND_BY_SLUG: Record<string, OgBrandVisual> = {
  [APP1_STORE_SLUG]: {
    alt: "Goat Indumentaria",
    background: "#ffffff",
    foreground: "#f13489",
    accent: "#737373",
    title: "GOAT",
    subtitle: "INDUMENTARIA",
    kind: "app1",
  },
  [APP2_STORE_SLUG]: {
    alt: "VAPORX",
    background: "#08080e",
    foreground: "#f0f0f5",
    accent: "#00e5ff",
    title: "VAPOR",
    subtitle: "X",
    kind: "app2",
  },
  [APP3_STORE_SLUG]: {
    alt: "Manoviva",
    background: "#f7f5f2",
    foreground: "#202523",
    accent: "#c86243",
    title: "Manoviva",
    subtitle: "ATELIER FATTO A MANO",
    kind: "app3",
  },
};

export function getOgBrandVisual(slug = getActiveStoreSlug()): OgBrandVisual {
  return OG_BRAND_BY_SLUG[slug] ?? OG_BRAND_BY_SLUG[APP1_STORE_SLUG];
}

export function getDefaultOgImageUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}${OG_IMAGE_PATH}`;
}
