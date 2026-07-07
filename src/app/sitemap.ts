import type { MetadataRoute } from "next";
import { generateStoreSitemap } from "@/lib/seo/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return generateStoreSitemap();
}
