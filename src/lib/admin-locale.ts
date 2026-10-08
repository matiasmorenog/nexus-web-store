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
  "/admin/modulos/coupons": {
    es: "Cupones y promociones",
    it: "Coupon e promozioni",
    shortEs: "Cupones",
    shortIt: "Coupon",
  },
  "/admin/modulos/homeEditor": {
    es: "Home editable",
    it: "Home modificabile",
    shortEs: "Home",
    shortIt: "Home",
  },
  "/admin/modulos/analytics": {
    es: "Analytics y reportes",
    it: "Analytics e report",
    shortEs: "Analytics",
    shortIt: "Analytics",
  },
  "/admin/modulos/crm": {
    es: "CRM lite",
    it: "CRM lite",
    shortEs: "CRM",
    shortIt: "CRM",
  },
  "/admin/modulos/shippingCarriers": {
    es: "Envíos carrier",
    it: "Spedizioni carrier",
    shortEs: "Envíos",
    shortIt: "Spedizioni",
  },
  "/admin/modulos/marketing": {
    es: "WhatsApp y Meta Pixel",
    it: "WhatsApp e Meta Pixel",
    shortEs: "WhatsApp",
    shortIt: "WhatsApp",
  },
  "/admin/modulos/multiUser": {
    es: "Multi-usuario",
    it: "Multi-utente",
    shortEs: "Usuarios",
    shortIt: "Utenti",
  },
  "/admin/modulos/api": {
    es: "API y webhooks",
    it: "API e webhook",
    shortEs: "API",
    shortIt: "API",
  },
  "/admin/modulos/seo": {
    es: "SEO avanzado",
    it: "SEO avanzato",
    shortEs: "SEO",
    shortIt: "SEO",
  },
  "/admin/modulos/wishlist": {
    es: "Wishlist",
    it: "Wishlist",
    shortEs: "Wishlist",
    shortIt: "Wishlist",
  },
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

/** Admin labels for product option axes (size/color), localized by admin_locale. */
export const adminProductOptions = {
  es: {
    sizeToggle: "Este producto tiene tamaño",
    sizeToggleHint:
      "Activá para definir formato o tamaño de la pieza. Desactivado: un solo SKU sin opciones de tamaño.",
    sizeInitial: (secondary: string) => `${secondary} inicial`,
    primaryInitial: (primary: string) => `${primary} inicial`,
  },
  it: {
    sizeToggle: "Questo prodotto ha una dimensione",
    sizeToggleHint:
      "Attiva per definire formato o dimensione del pezzo. Disattivato: un solo SKU senza opzioni di dimensione.",
    sizeInitial: (secondary: string) => `${secondary} iniziale`,
    primaryInitial: (primary: string) => `${primary} iniziale`,
  },
} as const;

export const APP3_ADMIN_VARIANT_LABELS: Record<
  AdminLocale,
  {
    primary: string;
    secondary: string;
    primaryInitial: string;
    secondaryInitial: string;
  }
> = {
  es: {
    primary: "Acabado",
    secondary: "Tamaño",
    primaryInitial: "Personalizado",
    secondaryInitial: "Único",
  },
  it: {
    primary: "Finitura",
    secondary: "Formato",
    primaryInitial: "Personalizzato",
    secondaryInitial: "Unico",
  },
};

const productNoun = {
  es: { one: "producto", many: "productos" },
  it: { one: "prodotto", many: "prodotti" },
} as const;

function productWord(locale: AdminLocale, count: number) {
  return count === 1 ? productNoun[locale].one : productNoun[locale].many;
}

/** Listado `/admin/productos`: header, toolbar, filtros, tabla, empty states. */
export const adminProducts = {
  es: {
    title: "Productos",
    catalogTitle: "Catálogo",
    catalogEmptyNoProducts:
      "No hay productos en el catálogo. Creá el primero con «Nuevo producto».",
    noMatchFilters: "Ningún producto coincide con los filtros.",
    newProduct: "Nuevo producto",
    createDescription: "Completá los datos del producto y su primera variante.",
    searchPlaceholder: "Buscar por nombre, slug, SKU...",
    searchAria: "Buscar productos",
    clearSearchAria: "Limpiar búsqueda",
    sortLabel: "Ordenar",
    filtersTitle: "Filtros",
    filtersDescription: "Categoría, público y estado.",
    categorySection: "Categoría",
    audienceSection: "Público",
    statusSection: "Estado",
    allFeminine: "Todas",
    allMasculine: "Todos",
    audienceHombre: "Hombre",
    audienceMujer: "Mujer",
    audienceUnisex: "Unisex",
    statusFeatured: "Destacado",
    statusNormal: "Normal",
    statusPromo2x1: "2x1",
    statusInactive: "Desactivado",
    statusInactiveFilter: "Desactivados",
    clearFilters: "Limpiar filtros",
    /** Template with `{label}` — plain string so Server Components can pass it to Client. */
    removeFilterAria: "Quitar filtro {label}",
    columns: {
      product: "Producto",
      category: "Categoría",
      price: "Precio",
      variants: "Variantes",
      status: "Estado",
      actions: "Acciones",
    },
    viewInStore: "Ver en tienda",
    editProductAria: (name: string) => `Editar ${name}`,
    deleteProductAria: (name: string) => `Eliminar ${name}`,
    deleteTitle: "Eliminar producto",
    deleteDescription: (name: string) =>
      `¿Eliminar "${name}"? Se borrarán también sus variantes. Esta acción no se puede deshacer.`,
    deleteConfirm: "Eliminar",
    deleteCancel: "Cancelar",
    loadMore: "Cargar más productos",
    loading: "Cargando...",
    showingOf: (loaded: number, total: number) =>
      `Mostrando ${loaded} de ${total}`,
    loadError: "Error al cargar productos",
    stockPartial: "Con variantes sin stock",
    stockSoldOut: "Agotados",
    sortOptions: {
      recientes: "Más recientes",
      "nombre-asc": "Nombre A–Z",
      "nombre-desc": "Nombre Z–A",
      "precio-asc": "Precio: menor a mayor",
      "precio-desc": "Precio: mayor a menor",
      categoria: "Categoría",
      "variantes-desc": "Más variantes",
    },
    headerCatalog: (total: number) =>
      `${total} ${productWord("es", total)} ${total === 1 ? "activo" : "activos"} en el catálogo`,
    headerFiltered: (shown: number, total: number) =>
      `${shown} de ${total} ${productWord("es", total)} con los filtros actuales`,
    catalogCountPartial: (loaded: number, total: number) =>
      `${loaded} de ${total} ${productWord("es", total)}`,
    catalogCountAll: (total: number) =>
      `${total} ${productWord("es", total)}`,
  },
  it: {
    title: "Prodotti",
    catalogTitle: "Catalogo",
    catalogEmptyNoProducts:
      "Non ci sono prodotti nel catalogo. Creane il primo con «Nuovo prodotto».",
    noMatchFilters: "Nessun prodotto corrisponde ai filtri.",
    newProduct: "Nuovo prodotto",
    createDescription:
      "Compila i dati del prodotto e della sua prima variante.",
    searchPlaceholder: "Cerca per nome, slug, SKU...",
    searchAria: "Cerca prodotti",
    clearSearchAria: "Cancella ricerca",
    sortLabel: "Ordina",
    filtersTitle: "Filtri",
    filtersDescription: "Categoria, pubblico e stato.",
    categorySection: "Categoria",
    audienceSection: "Pubblico",
    statusSection: "Stato",
    allFeminine: "Tutte",
    allMasculine: "Tutti",
    audienceHombre: "Uomo",
    audienceMujer: "Donna",
    audienceUnisex: "Unisex",
    statusFeatured: "In evidenza",
    statusNormal: "Normale",
    statusPromo2x1: "2x1",
    statusInactive: "Disattivato",
    statusInactiveFilter: "Disattivati",
    clearFilters: "Cancella filtri",
    /** Template with `{label}` — plain string so Server Components can pass it to Client. */
    removeFilterAria: "Rimuovi filtro {label}",
    columns: {
      product: "Prodotto",
      category: "Categoria",
      price: "Prezzo",
      variants: "Varianti",
      status: "Stato",
      actions: "Azioni",
    },
    viewInStore: "Vedi nel negozio",
    editProductAria: (name: string) => `Modifica ${name}`,
    deleteProductAria: (name: string) => `Elimina ${name}`,
    deleteTitle: "Elimina prodotto",
    deleteDescription: (name: string) =>
      `Eliminare "${name}"? Verranno eliminate anche le varianti. Questa azione non si può annullare.`,
    deleteConfirm: "Elimina",
    deleteCancel: "Annulla",
    loadMore: "Carica altri prodotti",
    loading: "Caricamento...",
    showingOf: (loaded: number, total: number) =>
      `Mostro ${loaded} di ${total}`,
    loadError: "Errore nel caricamento dei prodotti",
    stockPartial: "Con varianti senza stock",
    stockSoldOut: "Esauriti",
    sortOptions: {
      recientes: "Più recenti",
      "nombre-asc": "Nome A–Z",
      "nombre-desc": "Nome Z–A",
      "precio-asc": "Prezzo: dal minore al maggiore",
      "precio-desc": "Prezzo: dal maggiore al minore",
      categoria: "Categoria",
      "variantes-desc": "Più varianti",
    },
    headerCatalog: (total: number) =>
      `${total} ${productWord("it", total)} ${total === 1 ? "attivo" : "attivi"} nel catalogo`,
    headerFiltered: (shown: number, total: number) =>
      `${shown} di ${total} ${productWord("it", total)} con i filtri attuali`,
    catalogCountPartial: (loaded: number, total: number) =>
      `${loaded} di ${total} ${productWord("it", total)}`,
    catalogCountAll: (total: number) =>
      `${total} ${productWord("it", total)}`,
  },
} as const;

export type AdminProductsCopy = (typeof adminProducts)[AdminLocale];

export function getAdminProductsCopy(
  locale: AdminLocale = "es",
): AdminProductsCopy {
  return adminProducts[locale];
}

/** `ImageUploadField`: estado, ayuda y errores de subida. */
export const adminImageUpload = {
  es: {
    uploading: "Comprimiendo y subiendo…",
    helper: (maxWidth: number, maxHeight: number) =>
      `Se optimiza una sola vez en el navegador y se guarda como WebP (máx. ${maxWidth}×${maxHeight} px, ~400 KB). JPG, PNG, WebP o GIF (GIF hasta 4 MB).`,
    showUrl: "Pegar URL externa",
    hideUrl: "Ocultar URL externa",
    preview: "Vista previa",
    timeout:
      "La subida tardó demasiado. Revisá tu conexión e intentá de nuevo.",
    network:
      "No hay conexión con el servidor. Revisá tu internet y probá de nuevo.",
    unreadable:
      "No se pudo leer la imagen. Puede estar dañada: probá con otra foto o sacale una captura de pantalla y subí la captura.",
    errors: {
      unauthorized:
        "Tu sesión expiró. Recargá la página, volvé a iniciar sesión y subí la foto de nuevo.",
      missingFile: "No se recibió ninguna foto. Elegí la imagen de nuevo.",
      unsupportedFormat:
        "Formato no compatible. Usá JPG, PNG, WebP o GIF. Si es una foto de iPhone (HEIC), sacale una captura de pantalla y subí la captura, o en el iPhone activá Ajustes › Cámara › Formatos › «Más compatible».",
      tooLarge:
        "La foto es demasiado pesada, incluso comprimida. Probá con una foto más chica o sacale una captura de pantalla.",
      storageConfig:
        "Hay un problema de configuración del almacenamiento de fotos. Avisale al desarrollador.",
      failed:
        "No se pudo guardar la foto en el servidor. Esperá un minuto y probá de nuevo; si sigue fallando, mandá una captura.",
    },
  },
  it: {
    uploading: "Compressione e caricamento…",
    helper: (maxWidth: number, maxHeight: number) =>
      `Viene ottimizzata una sola volta nel browser e salvata come WebP (max ${maxWidth}×${maxHeight} px, ~400 KB). JPG, PNG, WebP o GIF (GIF fino a 4 MB).`,
    showUrl: "Incolla URL esterno",
    hideUrl: "Nascondi URL esterno",
    preview: "Anteprima",
    timeout:
      "Il caricamento ha impiegato troppo tempo. Controlla la connessione e riprova.",
    network:
      "Nessuna connessione con il server. Controlla internet e riprova.",
    unreadable:
      "Impossibile leggere l'immagine. Potrebbe essere danneggiata: prova con un'altra foto oppure fai uno screenshot e carica quello.",
    errors: {
      unauthorized:
        "La sessione è scaduta. Ricarica la pagina, accedi di nuovo e carica di nuovo la foto.",
      missingFile: "Nessuna foto ricevuta. Scegli di nuovo l'immagine.",
      unsupportedFormat:
        "Formato non supportato. Usa JPG, PNG, WebP o GIF. Se è una foto di iPhone (HEIC), fai uno screenshot e carica quello, oppure sull'iPhone attiva Impostazioni › Fotocamera › Formati › «Più compatibile».",
      tooLarge:
        "La foto è troppo pesante, anche compressa. Prova con una foto più piccola o fai uno screenshot.",
      storageConfig:
        "C'è un problema di configurazione dell'archivio foto. Avvisa lo sviluppatore.",
      failed:
        "Impossibile salvare la foto sul server. Aspetta un minuto e riprova; se continua, manda uno screenshot.",
    },
  },
} as const;

export type AdminImageUploadErrorCode = keyof (typeof adminImageUpload)["es"]["errors"];
