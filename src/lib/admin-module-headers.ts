/**
 * Stable titles/descriptions for /admin/modulos/* page headers.
 * Kept outside loading.tsx so the title does not skeleton on navigate.
 */

export type AdminModuleHeaderCopy = {
  title: string;
  description: string;
};

const MODULE_HEADERS: Record<string, AdminModuleHeaderCopy> = {
  "/admin/modulos/crm": {
    title: "CRM",
    description:
      "Clientes reales de la tienda: LTV, recompra, tags, segmentos y seguimiento comercial.",
  },
  "/admin/modulos/coupons": {
    title: "Cupones y promociones",
    description:
      "Códigos de descuento para el checkout. El descuento se aplica sobre el subtotal después de promos 2x1.",
  },
  "/admin/modulos/trafico": {
    title: "Tráfico",
    description:
      "Visitas reales de tu tienda: totales, tendencia, páginas, país, browser y dispositivos.",
  },
  "/admin/modulos/analytics": {
    title: "Tráfico",
    description:
      "Visitas reales de tu tienda: totales, tendencia, páginas, país, browser y dispositivos.",
  },
  "/admin/modulos/reportes": {
    title: "Reportes",
    description:
      "Insights de ventas, comparación de períodos, tops y export CSV.",
  },
  "/admin/modulos/marketing": {
    title: "WhatsApp y Meta Pixel",
    description: "Botón flotante de WhatsApp y pixel de conversión en tu tienda.",
  },
  "/admin/modulos/wishlist": {
    title: "Wishlist",
    description:
      "Interés de clientes registrados. Los visitantes sin cuenta guardan favoritos en el navegador.",
  },
  "/admin/modulos/seo": {
    title: "SEO avanzado",
    description:
      "Meta tags, sitemap dinámico, robots.txt y structured data para buscadores.",
  },
  "/admin/modulos/multiUser": {
    title: "Multi-usuario",
    description:
      "Invitá usuarios con rol administrador, vendedor, depósito o solo lectura.",
  },
  "/admin/modulos/homeEditor": {
    title: "Home editable",
    description: "Editá la home de la tienda sin tocar código ni redeploy.",
  },
  "/admin/modulos/api": {
    title: "API y webhooks",
    description:
      "Claves REST para integraciones y webhooks de eventos de la tienda.",
  },
  "/admin/modulos/shippingCarriers": {
    title: "Envíos carrier",
    description: "Cotización y etiquetas con operadores logísticos.",
  },
  "/admin/modulos/exports": {
    title: "Exports",
    description: "Exportá pedidos, productos y reportes en CSV.",
  },
};

const CRM_LIST_PATH = "/admin/modulos/crm";

/** Longest-prefix match for module route → header copy. */
export function resolveAdminModuleHeader(
  pathname: string,
): AdminModuleHeaderCopy | null {
  if (pathname === CRM_LIST_PATH || pathname.startsWith(`${CRM_LIST_PATH}/`)) {
    return MODULE_HEADERS[CRM_LIST_PATH] ?? null;
  }

  const exact = MODULE_HEADERS[pathname];
  if (exact) return exact;

  const match = Object.keys(MODULE_HEADERS)
    .filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];

  return match ? MODULE_HEADERS[match] : null;
}

export function isCrmDetailPath(pathname: string): boolean {
  if (!pathname.startsWith(`${CRM_LIST_PATH}/`)) return false;
  const rest = pathname.slice(CRM_LIST_PATH.length + 1);
  return Boolean(rest) && !rest.includes("/");
}
