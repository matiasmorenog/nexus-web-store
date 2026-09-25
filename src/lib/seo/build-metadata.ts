import type { Metadata } from "next";
import {
  normalizeMetaDescription,
  normalizeOgImageUrl,
  truncateMetaDescription,
} from "@/lib/seo/format";
import { getDefaultOgImageUrl, OG_IMAGE_SIZE } from "@/lib/seo/og-brand";
import { getStoreSiteUrl } from "@/lib/seo/site-url";
import type {
  ResolvedStoreSeoSettings,
  StoreSeoContext,
} from "@/lib/seo/types";
import { getStorefrontConfig } from "@/lib/store-verticals";

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
  context: StoreSeoContext,
  settings: ResolvedStoreSeoSettings | null,
  override?: string,
): string {
  const image = override?.trim() || settings?.ogImageUrl.trim();
  return image || getDefaultOgImageUrl(context.siteUrl);
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
  const locale = getStorefrontConfig().locale.replace("-", "_");
  const title = options?.title ?? context.storeName;
  const description = resolveDescription(settings, context, options?.description);
  const image = resolveOgImage(context, settings, options?.image);
  const canonical = options?.path
    ? `${context.siteUrl}${options.path.startsWith("/") ? options.path : `/${options.path}`}`
    : undefined;
  const social: Pick<Metadata, "openGraph" | "twitter"> = {
    openGraph: {
      type: "website",
      locale,
      url: canonical,
      siteName: context.storeName,
      title,
      description,
      images: [
        {
          url: image,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: context.storeName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  if (!settings) {
    return {
      metadataBase: new URL(context.siteUrl),
      title,
      description,
      ...social,
    };
  }

  return {
    metadataBase: new URL(context.siteUrl),
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: settings.robotsIndex
      ? { index: true, follow: true }
      : { index: false, follow: false },
    ...social,
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
