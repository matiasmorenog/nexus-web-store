import { getClientStorefrontConfig } from "@/lib/store-slug-client";

export type StorefrontPaths = {
  catalog: string;
  product: string;
  cart: string;
  contact: string;
  checkout: string;
  checkoutSuccess: string;
  checkoutPending: string;
  checkoutError: string;
  wishlist: string;
  account: string;
  signIn: string;
  register: string;
  forgotPassword: string;
  resetPassword: string;
  orders: string;
  security: string;
  shipping: string;
  terms: string;
  privacy: string;
  returns: string;
};

const SPANISH_PATHS: StorefrontPaths = {
  catalog: "/productos",
  product: "/producto",
  cart: "/carrito",
  contact: "/contacto",
  checkout: "/checkout",
  checkoutSuccess: "/checkout/exito",
  checkoutPending: "/checkout/pendiente",
  checkoutError: "/checkout/error",
  wishlist: "/favoritos",
  account: "/cuenta",
  signIn: "/cuenta/ingresar",
  register: "/cuenta/registrarse",
  forgotPassword: "/cuenta/recuperar-contrasena",
  resetPassword: "/cuenta/restablecer-contrasena",
  orders: "/cuenta/pedidos",
  security: "/cuenta/seguridad",
  shipping: "/envios",
  terms: "/terminos",
  privacy: "/privacidad",
  returns: "/cambios-y-devoluciones",
};

const ITALIAN_PATHS: StorefrontPaths = {
  catalog: "/prodotti",
  product: "/prodotto",
  cart: "/carrello",
  contact: "/contatti",
  checkout: "/cassa",
  checkoutSuccess: "/cassa/conferma",
  checkoutPending: "/cassa/in-attesa",
  checkoutError: "/cassa/errore",
  wishlist: "/preferiti",
  account: "/profilo",
  signIn: "/profilo/accedi",
  register: "/profilo/registrati",
  forgotPassword: "/profilo/recupera-password",
  resetPassword: "/profilo/reimposta-password",
  orders: "/profilo/ordini",
  security: "/profilo/sicurezza",
  shipping: "/consegne",
  terms: "/condizioni",
  privacy: "/privacy",
  returns: "/resi",
};

const CUSTOMER_AUTH_PATHS = new Set<string>([
  SPANISH_PATHS.signIn,
  SPANISH_PATHS.register,
  SPANISH_PATHS.forgotPassword,
  SPANISH_PATHS.resetPassword,
  ITALIAN_PATHS.signIn,
  ITALIAN_PATHS.register,
  ITALIAN_PATHS.forgotPassword,
  ITALIAN_PATHS.resetPassword,
]);

export function pathsForLocale(locale: string): StorefrontPaths {
  return locale === "it-IT" ? ITALIAN_PATHS : SPANISH_PATHS;
}

export function getStorefrontPaths(): StorefrontPaths {
  return pathsForLocale(getClientStorefrontConfig().locale);
}

export function productHref(slug: string): string {
  return `${getStorefrontPaths().product}/${slug}`;
}

export function orderHref(orderId: string): string {
  return `${getStorefrontPaths().orders}/${orderId}`;
}

export function catalogHref(query?: string): string {
  const base = getStorefrontPaths().catalog;
  if (!query) return base;
  const qs = query.replace(/^\?/, "");
  return qs ? `${base}?${qs}` : base;
}

export function isCatalogPathname(pathname: string): boolean {
  return pathname === SPANISH_PATHS.catalog || pathname === ITALIAN_PATHS.catalog;
}

export function isContactPathname(pathname: string): boolean {
  return pathname === SPANISH_PATHS.contact || pathname === ITALIAN_PATHS.contact;
}

export function isOrdersPathname(pathname: string): boolean {
  return (
    pathname === SPANISH_PATHS.orders ||
    pathname.startsWith(`${SPANISH_PATHS.orders}/`) ||
    pathname === ITALIAN_PATHS.orders ||
    pathname.startsWith(`${ITALIAN_PATHS.orders}/`)
  );
}

export function isWishlistPathname(pathname: string): boolean {
  return pathname === SPANISH_PATHS.wishlist || pathname === ITALIAN_PATHS.wishlist;
}

export function isSecurityPathname(pathname: string): boolean {
  return pathname === SPANISH_PATHS.security || pathname === ITALIAN_PATHS.security;
}

export function isCustomerAuthPath(pathname: string): boolean {
  return CUSTOMER_AUTH_PATHS.has(pathname);
}

const INFO_SLUG_TO_PATH: Record<string, keyof StorefrontPaths> = {
  contacto: "contact",
  envios: "shipping",
  terminos: "terms",
  privacidad: "privacy",
  "cambios-y-devoluciones": "returns",
};

const PATH_KEYS = {
  catalog: "catalog",
  product: "product",
  cart: "cart",
  contact: "contact",
  checkout: "checkout",
  wishlist: "wishlist",
  accountOrders: "orders",
  signIn: "signIn",
  register: "register",
  forgotPassword: "forgotPassword",
  resetPassword: "resetPassword",
  security: "security",
} as const satisfies Record<string, keyof StorefrontPaths>;

export function storefrontPath(key: keyof typeof PATH_KEYS): string {
  return getStorefrontPaths()[PATH_KEYS[key]];
}

export function infoPageHref(slug: string): string {
  const key = INFO_SLUG_TO_PATH[slug];
  if (!key) return `/${slug}`;
  return getStorefrontPaths()[key];
}
