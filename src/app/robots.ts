import type { MetadataRoute } from "next";
import { generateStoreRobots } from "@/lib/seo/sitemap";

export default async function robots(): Promise<MetadataRoute.Robots> {
  return generateStoreRobots();
}
