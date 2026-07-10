import type { MetadataRoute } from "next";
import { INFO_PAGE_SLUGS } from "@/lib/info-pages";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";
import { getStorefrontProductSlugs } from "@/lib/product-page-query";
import { getStoreSiteUrl } from "@/lib/seo/site-url";
import { getStoreId } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";

function buildEntry(
  baseUrl: string,
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export async function generateStoreSitemap(): Promise<MetadataRoute.Sitemap> {
  const storeId = await getStoreId();
  const baseUrl = getStoreSiteUrl();
  const config = getStorefrontConfig();
  const seoEnabled = await storeHasModule(storeId, "seo");

  const entries: MetadataRoute.Sitemap = [
    buildEntry(baseUrl, "/", 1, "daily"),
  ];

  if (!seoEnabled) {
    return entries;
  }

  if (config.features.catalog) {
    entries.push(buildEntry(baseUrl, "/productos", 0.9, "daily"));

    const products = await getStorefrontProductSlugs(storeId);
    for (const product of products) {
      entries.push(
        buildEntry(baseUrl, `/producto/${product.slug}`, 0.8, "weekly"),
      );
    }
  }

  for (const slug of INFO_PAGE_SLUGS) {
    entries.push(buildEntry(baseUrl, `/${slug}`, 0.4, "monthly"));
  }

  return entries;
}

export async function generateStoreRobots(): Promise<MetadataRoute.Robots> {
  const storeId = await getStoreId();
  const baseUrl = getStoreSiteUrl();
  const seoEnabled = await storeHasModule(storeId, "seo");

  if (!seoEnabled) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  const settings = await db.storeSeoSettings.findUnique({
    where: { storeId },
    select: { robotsIndex: true },
  });

  const allowIndex = settings?.robotsIndex ?? true;

  return {
    rules: allowIndex
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/api", "/checkout", "/cuenta"],
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
