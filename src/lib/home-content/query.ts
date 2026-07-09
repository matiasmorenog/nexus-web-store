import { unstable_cache } from "next/cache";
import {
  buildDefaultHomeContent,
  sortHomeSections,
} from "@/lib/home-content/defaults";
import {
  HOME_CONTENT_VERSION,
  homeContentPayloadSchema,
  type HomeContentPayload,
} from "@/lib/home-content/types";
import { STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-ttl";
import { db } from "@/lib/db";
import { storeHasModule } from "@/lib/modules";
import { getStorefrontKind } from "@/lib/store-verticals";
import { formatStoreName, getStore } from "@/lib/store-context";

export const HOME_CONTENT_CACHE_TAG = "home-content";

async function loadHomeContentRow(storeId: string) {
  return db.storeHomeContent.findUnique({
    where: { storeId },
    select: { payload: true },
  });
}

function parsePayload(
  raw: unknown,
  vertical: "app1" | "app2",
  storeDisplayName: string,
): HomeContentPayload {
  const parsed = homeContentPayloadSchema.safeParse(raw);
  if (parsed.success) {
    return {
      version: HOME_CONTENT_VERSION,
      sections: sortHomeSections(parsed.data.sections),
    };
  }

  return buildDefaultHomeContent(vertical, storeDisplayName);
}

export async function getStoreHomeContent(
  storeId: string,
  options?: { storeDisplayName?: string; vertical?: "app1" | "app2" },
): Promise<HomeContentPayload> {
  const vertical = options?.vertical ?? getStorefrontKind();
  const store = options?.storeDisplayName
    ? { name: options.storeDisplayName }
    : await getStore();
  const storeDisplayName =
    options?.storeDisplayName ?? formatStoreName(store.name);

  const moduleEnabled = await storeHasModule(storeId, "homeEditor");
  if (!moduleEnabled) {
    return buildDefaultHomeContent(vertical, storeDisplayName);
  }

  const cached = unstable_cache(
    async () => {
      const row = await loadHomeContentRow(storeId);
      if (!row?.payload) {
        return buildDefaultHomeContent(vertical, storeDisplayName);
      }
      return parsePayload(row.payload, vertical, storeDisplayName);
    },
    [`home-content-${storeId}-${vertical}`],
    {
      tags: [HOME_CONTENT_CACHE_TAG, `${HOME_CONTENT_CACHE_TAG}:${storeId}`],
      revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS,
    },
  );

  return cached();
}

export async function getStoreHomeContentForAdmin(
  storeId: string,
): Promise<HomeContentPayload> {
  const vertical = getStorefrontKind();
  const store = await getStore();
  const storeDisplayName = formatStoreName(store.name);
  const defaults = buildDefaultHomeContent(vertical, storeDisplayName);

  const row = await loadHomeContentRow(storeId);
  if (!row?.payload) {
    return defaults;
  }

  const parsed = homeContentPayloadSchema.safeParse(row.payload);
  if (!parsed.success) {
    return defaults;
  }

  return {
    version: HOME_CONTENT_VERSION,
    sections: sortHomeSections(parsed.data.sections),
  };
}

export function getEnabledHomeSections(payload: HomeContentPayload) {
  return sortHomeSections(payload.sections).filter((section) => section.enabled);
}
