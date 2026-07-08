/**
 * Contenido del banner sticky del header. La activación 2x1 se controla
 * desde el módulo "Cupones y promociones" (StorePromotionSettings), no acá.
 */
export const promoBanner = {
  /** Identificador de la promo (por si hay varias en el futuro). */
  id: "2x1-productos",
  badge: "2x1",
  headline: "en productos seleccionados",
  detail: "Llevá dos del mismo producto y pagá uno.",
  href: "/productos?promo=2x1",
  cta: "Ver catálogo",
  /** Espera tras `window.load` antes de animar la entrada (ms). */
  enterDelayMs: 500,
} as const;

export function promoBannerDismissKey(id: string = promoBanner.id) {
  return `storefront-promo-dismissed:${id}`;
}
