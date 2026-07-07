import type { Metadata } from "next";
import {
  normalizeMetaDescription,
  normalizeOgImageUrl,
  truncateMetaDescription,
} from "@/lib/seo/format";
import { getStoreSiteUrl } from "@/lib/seo/site-url";
import type {
  ResolvedStoreSeoSettings,
  StoreSeoContext,
} from "@/lib/seo/types";

function resolveDescription(
  settings: ResolvedStoreSeoSettings | null,
  context: StoreSeoContext,
  override?: string,
): string {
  const candidate =
    override?.trim() ||
    settings?.metaDescription.trim() ||
    context.fallbackDescription;
  return truncateMetaDescription(candidate);
}

function resolveOgImage(
  settings: ResolvedStoreSeoSettings | null,
  override?: string,
): string | undefined {
  const image = override?.trim() || settings?.ogImageUrl.trim();
  return image || undefined;
}

export function buildStorefrontMetadata(
  settings: ResolvedStoreSeoSettings | null,
  context: StoreSeoContext,
  options?: {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: "website" | "product";
  },
): Metadata {
  const title = options?.title ?? context.storeName;
  const description = resolveDescription(settings, context, options?.description);
  const image = resolveOgImage(settings, options?.image);
  const canonical = options?.path
    ? `${context.siteUrl}${options.path.startsWith("/") ? options.path : `/${options.path}`}`
    : undefined;

  if (!settings) {
    return {
      title,
      description,
    };
  }

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: settings.robotsIndex
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: canonical,
      siteName: context.storeName,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function buildSeoContext(
  storeName: string,
  fallbackDescription: string,
): StoreSeoContext {
  return {
    siteUrl: getStoreSiteUrl(),
    storeName,
    fallbackDescription,
  };
}

export function parseSeoSettingsInput(input: unknown): {
  metaDescription: string;
  ogImageUrl: string;
  robotsIndex: boolean;
  structuredDataEnabled: boolean;
} {
  const data = (input ?? {}) as Record<string, unknown>;

  return {
    metaDescription: normalizeMetaDescription(data.metaDescription),
    ogImageUrl: normalizeOgImageUrl(data.ogImageUrl),
    robotsIndex: data.robotsIndex !== false,
    structuredDataEnabled: data.structuredDataEnabled !== false,
  };
}
