import {
  APP3_ADMIN_VARIANT_LABELS,
  readAdminLocaleFromDocument,
  type AdminLocale,
} from "@/lib/admin-locale";
import { getClientStorefrontConfig } from "@/lib/store-slug-client";
import { getStorefrontConfig } from "@/lib/store-verticals";
import type { VariantLabels } from "@/lib/store-verticals/types";

export function getVariantLabels(): VariantLabels {
  return getStorefrontConfig().variantLabels;
}

/** Storefront / server labels (vertical language, not admin cookie). */
export function getClientVariantLabels(): VariantLabels {
  return getClientStorefrontConfig().variantLabels;
}

/**
 * Admin UI labels: Manoviva (app3) follows admin_locale so Spanish admins
 * do not see leftover Italian Formato/Finitura/Unico.
 */
export function getAdminVariantLabels(
  locale: AdminLocale = readAdminLocaleFromDocument(),
): VariantLabels {
  const config = getClientStorefrontConfig();
  if (config.id === "app3") {
    return APP3_ADMIN_VARIANT_LABELS[locale];
  }
  return config.variantLabels;
}
