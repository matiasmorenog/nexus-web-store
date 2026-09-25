/** Italian public aliases → Spanish App Router destinations (Manoviva build only). */
export const STOREFRONT_ROUTE_ALIASES = [
  { source: "/prodotti", destination: "/productos" },
  { source: "/prodotto/:slug", destination: "/producto/:slug" },
  { source: "/carrello", destination: "/carrito" },
  { source: "/contatti", destination: "/contacto" },
  { source: "/consegne", destination: "/envios" },
  { source: "/condizioni", destination: "/terminos" },
  { source: "/privacy", destination: "/privacidad" },
  { source: "/resi", destination: "/cambios-y-devoluciones" },
  { source: "/preferiti", destination: "/favoritos" },
  { source: "/profilo/accedi", destination: "/cuenta/ingresar" },
  { source: "/profilo/registrati", destination: "/cuenta/registrarse" },
  { source: "/profilo/recupera-password", destination: "/cuenta/recuperar-contrasena" },
  { source: "/profilo/reimposta-password", destination: "/cuenta/restablecer-contrasena" },
  { source: "/profilo/ordini", destination: "/cuenta/pedidos" },
  { source: "/profilo/ordini/:orderId", destination: "/cuenta/pedidos/:orderId" },
  { source: "/profilo/sicurezza", destination: "/cuenta/seguridad" },
  { source: "/profilo", destination: "/cuenta" },
  { source: "/cassa/conferma", destination: "/checkout/exito" },
  { source: "/cassa/exito", destination: "/checkout/exito" },
  { source: "/cassa/successo", destination: "/checkout/exito" },
  { source: "/cassa/pendiente", destination: "/checkout/pendiente" },
  { source: "/cassa/in-attesa", destination: "/checkout/pendiente" },
  { source: "/cassa/error", destination: "/checkout/error" },
  { source: "/cassa/errore", destination: "/checkout/error" },
  { source: "/cassa", destination: "/checkout" },
] as const;

export const APP3_STORE_SLUG_FOR_CONFIG = "manoviva-italia";

export function isManovivaDeployEnv(): boolean {
  const slug =
    process.env.DEFAULT_STORE_SLUG ??
    process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG ??
    "";
  return slug === APP3_STORE_SLUG_FOR_CONFIG;
}
