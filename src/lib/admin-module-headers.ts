/**
 * Stable titles/descriptions for /admin/modulos/* and config submenu headers.
 * Kept outside loading.tsx so the title does not skeleton on navigate.
 */

import type { AdminLocale } from "@/lib/admin-locale";
import { adminChrome, adminNavLabel } from "@/lib/admin-locale";
import { storeHidesMercadoPago } from "@/lib/modules/access";
import { ADMIN_CONFIG_SUBMENU_MODULE_IDS } from "@/lib/modules/admin-nav";
import { moduleAdminPath, type ModuleId } from "@/lib/modules";

export type AdminModuleHeaderCopy = {
  title: string;
  description: string;
};

export type AdminTrailHeaderCopy = AdminModuleHeaderCopy & {
  parentTitle: string;
  parentHref: string;
};

const CONFIG_HUB_HREF = "/admin/configuracion";

/** Module routes that live under the Configuración accordion. */
const CONFIG_TRAIL_MODULE_PATHS = new Set(
  ADMIN_CONFIG_SUBMENU_MODULE_IDS.flatMap((moduleId) => {
    const id = moduleId as ModuleId;
    return [moduleAdminPath(id), `/admin/modulos/${id}`];
  }),
);

const MODULE_HEADERS: Record<string, AdminModuleHeaderCopy> = {
  "/admin/modulos/crm": {
    title: "CRM",
    description:
      "Clientes reales de la tienda: LTV, recompra, tags, segmentos y seguimiento comercial.",
  },
  "/admin/modulos/coupons": {
    title: "Cupones y promociones",
    description:
      "Códigos de descuento en checkout (sobre el subtotal, después de la promo 2x1).",
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

function cobrosDescription(locale: AdminLocale): string {
  if (storeHidesMercadoPago()) {
    return locale === "it"
      ? "Carta (Stripe), bonifico bancario (IBAN) e metodi di pagamento nel checkout."
      : "Tarjeta (Stripe), bonifico bancario (IBAN) y métodos de pago en checkout.";
  }
  return locale === "it"
    ? "Mercado Pago, carta (Stripe), bonifico con sconto e metodi di pagamento nel checkout."
    : "Mercado Pago, tarjeta (Stripe), transferencia con descuento y métodos de pago en checkout.";
}

function configRouteDescription(
  pathname: string,
  locale: AdminLocale,
): string | null {
  const chrome = adminChrome[locale];
  switch (pathname) {
    case "/admin/configuracion/idioma":
      return chrome.languageHint;
    case "/admin/configuracion/seguridad":
      return chrome.securityHint;
    case "/admin/configuracion/qr":
      return chrome.qrHint;
    case "/admin/configuracion/cobros":
      return cobrosDescription(locale);
    case "/admin/configuracion/envios":
      return locale === "it"
        ? "Preventivo Mercado Envíos per CAP, ritiro in negozio e tracking ordini."
        : "Cotización Mercado Envíos por CP, retiro en local y seguimiento de pedidos.";
    case "/admin/plan":
      return locale === "it"
        ? "Piano base e moduli Plus disponibili per il tuo negozio."
        : "Plan base y módulos Plus disponibles para tu tienda.";
    default:
      return null;
  }
}

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

export function moduleHeaderUsesConfigTrail(modulePath: string): boolean {
  if (CONFIG_TRAIL_MODULE_PATHS.has(modulePath)) return true;
  return [...CONFIG_TRAIL_MODULE_PATHS].some(
    (path) => modulePath === path || modulePath.startsWith(`${path}/`),
  );
}

/** Config submenu pages: Configuración › current. */
export function resolveAdminConfigTrailHeader(
  pathname: string,
  locale: AdminLocale = "es",
): AdminTrailHeaderCopy | null {
  const description = configRouteDescription(pathname, locale);
  const title = adminNavLabel(pathname, locale);
  const parentTitle = adminNavLabel(CONFIG_HUB_HREF, locale);
  if (!description || !title || !parentTitle) return null;

  return {
    parentTitle,
    parentHref: CONFIG_HUB_HREF,
    title,
    description,
  };
}

/** Module under Config accordion: Configuración › module title. */
export function resolveAdminModuleTrailHeader(
  modulePath: string,
  locale: AdminLocale = "es",
): AdminTrailHeaderCopy | null {
  const copy = resolveAdminModuleHeader(modulePath);
  if (!copy || !moduleHeaderUsesConfigTrail(modulePath)) return null;

  const parentTitle = adminNavLabel(CONFIG_HUB_HREF, locale);
  if (!parentTitle) return null;

  const localizedTitle =
    adminNavLabel(modulePath, locale) ??
    adminNavLabel(moduleAdminPathFromModuleHeaders(modulePath), locale) ??
    copy.title;

  return {
    parentTitle,
    parentHref: CONFIG_HUB_HREF,
    title: localizedTitle,
    description: copy.description,
  };
}

function moduleAdminPathFromModuleHeaders(modulePath: string): string {
  if (modulePath.startsWith("/admin/modulos/shippingCarriers")) {
    return "/admin/configuracion/envios";
  }
  return modulePath;
}

export function isCrmDetailPath(pathname: string): boolean {
  if (!pathname.startsWith(`${CRM_LIST_PATH}/`)) return false;
  const rest = pathname.slice(CRM_LIST_PATH.length + 1);
  return Boolean(rest) && !rest.includes("/");
}
