/**
 * TTL de fallback para `unstable_cache` (segundos).
 * Las mutaciones relevantes invalidan por tag/path; el TTL solo cubre
 * cambios fuera del flujo normal o si falló una invalidación.
 */

/** Config de tienda (`getStore`). Invalidación: tag `store` al guardar configuración. */
export const STORE_CACHE_REVALIDATE_SECONDS = 3600;

/**
 * Catálogo público: queries (`unstable_cache`) e ISR (`export const revalidate`
 * en home, `/productos`, PDP). Mismas causas de invalidación en ambas capas.
 */
export const STOREFRONT_CATALOG_REVALIDATE_SECONDS = 600;

/** Dashboard admin. Invalidación: tag al editar productos/pedidos o pago confirmado. */
export const ADMIN_DASHBOARD_CACHE_REVALIDATE_SECONDS = 300;

/** Facetas del listado de productos en admin. Invalidación: tag al editar catálogo. */
export const ADMIN_PRODUCTS_SUMMARY_CACHE_REVALIDATE_SECONDS = 600;
