import { getStoreSiteUrl } from "@/lib/seo/site-url";
import { pathsForLocale } from "@/lib/storefront-paths";
import { getStorefrontConfig } from "@/lib/store-verticals";

export type AdminQrProductOption = {
  id: string;
  name: string;
  slug: string;
};

function joinSiteUrl(path: string): string {
  const base = getStoreSiteUrl();
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Absolute storefront home URL for the current deploy. */
export function getStorefrontHomeAbsoluteUrl(): string {
  return joinSiteUrl("/");
}

/** Absolute PDP URL for a product slug (locale-aware path). */
export function getStorefrontProductAbsoluteUrl(slug: string): string {
  const paths = pathsForLocale(getStorefrontConfig().locale);
  return joinSiteUrl(`${paths.product}/${slug}`);
}

export function buildQrDownloadFilename(label: string): string {
  const slug = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `qr-${slug || "tienda"}.png`;
}
