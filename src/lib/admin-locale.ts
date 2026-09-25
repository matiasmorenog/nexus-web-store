export const ADMIN_LOCALE_COOKIE = "admin_locale";

export type AdminLocale = "es" | "it";

export function parseAdminLocale(value: string | undefined | null): AdminLocale {
  return value === "it" ? "it" : "es";
}

export function readAdminLocaleFromDocument(): AdminLocale {
  if (typeof document === "undefined") return "es";
  const match = document.cookie.match(/(?:^|; )admin_locale=(es|it)(?:;|$)/);
  return parseAdminLocale(match?.[1]);
}

const NAV_LABELS: Record<string, { es: string; it: string; shortEs: string; shortIt: string }> = {
  "/admin": { es: "Dashboard", it: "Dashboard", shortEs: "Inicio", shortIt: "Home" },
  "/admin/pedidos": { es: "Pedidos", it: "Ordini", shortEs: "Pedidos", shortIt: "Ordini" },
  "/admin/productos": { es: "Productos", it: "Prodotti", shortEs: "Productos", shortIt: "Prodotti" },
  "/admin/categorias": { es: "Categorías", it: "Categorie", shortEs: "Categorías", shortIt: "Categorie" },
  "/admin/modulos/cobros": { es: "Cobros", it: "Pagamenti", shortEs: "Cobros", shortIt: "Pagamenti" },
  "/admin/configuracion": { es: "Configuración", it: "Impostazioni", shortEs: "Config", shortIt: "Impostazioni" },
  "/admin/plan": { es: "Plan y módulos", it: "Piano e moduli", shortEs: "Plan", shortIt: "Piano" },
};

export function localizeAdminNavItem<T extends { href: string; label: string; shortLabel: string }>(
  item: T,
  locale: AdminLocale,
): T {
  const labels = NAV_LABELS[item.href];
  if (!labels) return item;
  return {
    ...item,
    label: locale === "it" ? labels.it : labels.es,
    shortLabel: locale === "it" ? labels.shortIt : labels.shortEs,
  };
}

export const adminLogin = {
  es: {
    panel: "Panel de administración",
    panelLead: "Gestioná productos, pedidos y la configuración de tu tienda desde un solo lugar.",
    signIn: "Iniciar sesión",
    passwordUpdated: "Contraseña actualizada. Podés ingresar con tu nueva contraseña.",
    googleNotAdmin: "Google solo funciona con cuentas de administración ya registradas.",
    googleLinkError: "No se pudo vincular tu cuenta de Google.",
    backToStore: "← Volver a la tienda",
    wrongCredentials: "Email o contraseña incorrectos",
    noAdminAccess: "Esta cuenta no tiene acceso al panel admin.",
    password: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    rememberMe: "Recordarme",
    signingIn: "Ingresando...",
    signInAction: "Ingresar",
    forgot: "¿Olvidaste tu contraseña?",
    continueWithGoogle: "Continuar con Google",
  },
  it: {
    panel: "Pannello di amministrazione",
    panelLead: "Gestisci prodotti, ordini e le impostazioni del negozio da un unico posto.",
    signIn: "Accedi",
    passwordUpdated: "Password aggiornata. Ora puoi accedere.",
    googleNotAdmin: "Google funziona solo con account di amministrazione già registrati.",
    googleLinkError: "Non è stato possibile collegare l'account Google.",
    backToStore: "← Torna al negozio",
    wrongCredentials: "Email o password non corrette",
    noAdminAccess: "Questo account non ha accesso al pannello admin.",
    password: "Password",
    showPassword: "Mostra password",
    hidePassword: "Nascondi password",
    rememberMe: "Ricordami",
    signingIn: "Accesso...",
    signInAction: "Accedi",
    forgot: "Password dimenticata?",
    continueWithGoogle: "Continua con Google",
  },
} as const;

export const adminChrome = {
  es: {
    viewStore: "Ver tienda",
    store: "Tienda",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    menu: "Menú de administración",
    nav: "Navegación principal",
    plan: "Plan",
    signOut: "Cerrar sesión",
    language: "Idioma",
    languageHint: "El panel y el inicio de sesión usan este idioma en este navegador.",
    spanish: "Español",
    italian: "Italiano",
  },
  it: {
    viewStore: "Vedi negozio",
    store: "Negozio",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    menu: "Menu di amministrazione",
    nav: "Navigazione principale",
    plan: "Piano",
    signOut: "Esci",
    language: "Lingua",
    languageHint: "Il pannello e l'accesso usano questa lingua in questo browser.",
    spanish: "Spagnolo",
    italian: "Italiano",
  },
} as const;
