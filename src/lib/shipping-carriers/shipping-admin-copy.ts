import type { AdminLocale } from "@/lib/admin-locale";
import type { AdminSetupGuideStep } from "@/components/admin/admin-setup-guide";

const ML_PANEL = "https://www.mercadolibre.com.ar/developers/panel";
const ML_CREDS = `${ML_PANEL}/app`;
const ML_SHIPPING_DOCS =
  "https://developers.mercadolibre.com.ar/es_ar/mercado-envios";
const MICORREO_FAQS =
  "https://www.correoargentino.com.ar/MiCorreo/public/faqs";
const MICORREO_API_PDF =
  "https://www.correoargentino.com.ar/MiCorreo/public/img/pag/apiMiCorreo.pdf";
const ANDREANI_DEV = "https://developers-sandbox.andreani.com/";
const ANDREANI_PYMES =
  "https://pymes.andreani.com/integraciones/";

type CarrierGuideCopy = {
  guideToggle: string;
  guideIntro: string;
  guideSteps: AdminSetupGuideStep[];
};

const shippingAdminCopy = {
  es: {
    save: "Guardar envíos",
    saving: "Guardando...",
    saved: "Configuración de envíos guardada. Los cambios aplican en el checkout al instante.",
    errorFallback: "No se pudo guardar la configuración.",
    readOnly: "Solo lectura.",
    globalTitle: "Cotización en checkout",
    globalDescription:
      "Costo por código postal del comprador. Solo se cotizan operadores con credenciales válidas.",
    carriersEnabled: "Activar cotización por CP en checkout",
    originZipLabel: "CP de origen (depósito)",
    originZipHint: "Desde dónde despachás. Requerido para cotizar.",
    weightLabel: "Peso default por ítem (g)",
    weightHint: "Usado para estimar el paquete en cotizaciones.",
    operatorsLabel: "Operadores en checkout",
    operatorsHint:
      "Activá los que quieras ofrecer. Solo aparecen si están configurados. El comprador elige entre los activos.",
    missingConfigBadge: "Falta configurar",
    pickupTitle: "Retiro en local",
    pickupDescription: "Retiro en local siempre es gratis.",
    allowPickup: "Permitir retiro en local",

    mercadoEnvios: {
      title: "Mercado Envíos",
      description:
        "Cotizá y gestioná envíos con la API de Mercado Libre. El token de Cobros (Mercado Pago) suele alcanzar.",
      accessTokenLabel: "Access Token",
      accessTokenPlaceholderNew: "TEST-... o APP_USR-...",
      accessTokenPlaceholderKeep: "Dejá vacío para mantener el token actual",
      clearToken: "Quitar token guardado en admin",
      mlaItemLabel: "Item MLA de referencia (opcional)",
      mlaItemHint:
        "Publicación MLA con Mercado Envíos activo. Mejora la cotización real.",
      sourceAdmin: "Token Mercado Envíos en admin",
      sourceMp: "Usando token de Mercado Pago (Cobros)",
      sourceEnv: "Configurado en servidor (variable de entorno)",
      sourceNone: "Sin token — no cotiza hasta configurarlo",
      guideToggle: "Guía de configuración de Mercado Envíos",
      guideIntro:
        "Necesitás un Access Token de Mercado Libre / Mercado Pago. Empezá en prueba (TEST-) y pasá a producción (APP_USR-) cuando cotice bien.",
      guideSteps: [
        {
          title: "Creá o abrí tu aplicación",
          body: "Entrá al panel de desarrolladores de Mercado Libre y abrí (o creá) la aplicación vinculada a la tienda.",
          link: { label: "Panel de desarrolladores", href: ML_PANEL },
        },
        {
          title: "Copiá el Access Token",
          body: "Credenciales de prueba o de producción. Copiá el Access Token (TEST-… o APP_USR-…) y pegalo arriba. Si ya configuraste Cobros, podés dejar vacío: Envíos reutiliza ese token.",
          link: { label: "Credenciales", href: ML_CREDS },
        },
        {
          title: "CP de origen e ítem MLA (opcional)",
          body: "Completá el CP del depósito en la tarjeta de cotización. Si tenés una publicación MLA con Mercado Envíos, pegá el ID (MLA…) para mejorar la cotización.",
          link: { label: "Docs Mercado Envíos", href: ML_SHIPPING_DOCS },
        },
        {
          title: "Activá el operador y guardá",
          body: "Activá «Mercado Envíos» en operadores, guardá, y probá el checkout con un CP válido. Debés ver costo y plazo reales (no demo).",
        },
        {
          title: "Despacho / etiqueta",
          body: "Al generar el envío desde el pedido, la app intenta crear el envío vía API. Si tu cuenta no tiene Mercado Envíos habilitado para crear guías, el error se muestra en el pedido y podés completar el despacho en ML.",
        },
      ] satisfies AdminSetupGuideStep[],
    } satisfies CarrierGuideCopy & Record<string, unknown>,

    correo: {
      title: "Correo Argentino (MiCorreo)",
      description:
        "Cotización e importación de envíos con la API MiCorreo. Credenciales las da Correo Argentino a tu comercio.",
      userLabel: "Usuario MiCorreo (API)",
      passwordLabel: "Contraseña API",
      passwordPlaceholderKeep: "Dejá vacío para mantener la contraseña actual",
      customerIdLabel: "Customer ID",
      customerIdHint: "Identificador de cliente MiCorreo (ej. 0000550137).",
      sandboxLabel: "Usar ambiente de prueba (QA)",
      clearCredentials: "Quitar credenciales de Correo",
      notConfigured: "Sin credenciales — no cotiza hasta configurarlas",
      configured: "Credenciales guardadas",
      guideToggle: "Guía de configuración de Correo Argentino",
      guideIntro:
        "La integración es con la API MiCorreo (PAQ.AR). Pedí usuario, contraseña y customerId a un ejecutivo de Correo. Empezá en QA y pasá a producción cuando cotice bien.",
      guideSteps: [
        {
          title: "Pedí las credenciales a Correo",
          body: "Contactá a Correo Argentino / MiCorreo y solicitá acceso API (usuario, contraseña y customerId) para QA y luego producción. La integración en sí no tiene costo; pagás por envío.",
          link: { label: "Preguntas frecuentes MiCorreo", href: MICORREO_FAQS },
        },
        {
          title: "Revisá la documentación de la API",
          body: "Autenticación: POST /token con HTTP Basic. Cotizar: POST /rates. Importar envíos: endpoints de órdenes de la API MiCorreo.",
          link: { label: "Manual API MiCorreo (PDF)", href: MICORREO_API_PDF },
        },
        {
          title: "Cargá usuario, contraseña y Customer ID",
          body: "Pegá las credenciales arriba. Dejá «ambiente de prueba» activo mientras uses QA (apitest.correoargentino.com.ar).",
        },
        {
          title: "CP de origen y operador",
          body: "Completá el CP del depósito, activá «Correo Argentino» en operadores y guardá.",
        },
        {
          title: "Probá cotización y alta de envío",
          body: "En el checkout, con un CP válido, debe aparecer Correo con precio real. Al generar el envío desde un pedido pagado, se crea la orden en MiCorreo y queda el tracking en el pedido.",
        },
      ] satisfies AdminSetupGuideStep[],
    } satisfies CarrierGuideCopy & Record<string, unknown>,

    andreani: {
      title: "Andreani",
      description:
        "Cotización, alta de envío y etiqueta con la API Andreani. Credenciales (Client ID / Secret) y número de contrato las da Andreani.",
      clientIdLabel: "Client ID",
      clientSecretLabel: "Client Secret",
      clientSecretPlaceholderKeep: "Dejá vacío para mantener el secret actual",
      contratoLabel: "Número de contrato",
      contratoHint: "Contrato Andreani asociado a tu cuenta (obligatorio para cotizar).",
      sandboxLabel: "Usar sandbox (apisqa.andreani.com)",
      clearCredentials: "Quitar credenciales de Andreani",
      notConfigured: "Sin credenciales — no cotiza hasta configurarlas",
      configured: "Credenciales guardadas",
      guideToggle: "Guía de configuración de Andreani",
      guideIntro:
        "Necesitás Client ID, Client Secret y número de contrato. Empezá en sandbox y pasá a producción cuando cotice y genere etiquetas bien.",
      guideSteps: [
        {
          title: "Obtené las credenciales",
          body: "Clientes PyME: portal de integraciones Andreani. Corporativos: canal comercial / portal corporativo. Vas a recibir Client ID y Client Secret.",
          link: { label: "Integraciones PyME", href: ANDREANI_PYMES },
        },
        {
          title: "Probalas en el portal de desarrolladores",
          body: "Usá el sandbox para validar autenticación (Basic → Bearer JWT), cotizador y órdenes antes de pegar producción acá.",
          link: { label: "Andreani Developers", href: ANDREANI_DEV },
        },
        {
          title: "Cargá Client ID, Secret y contrato",
          body: "Pegá las credenciales y el número de contrato arriba. Dejá sandbox activo mientras uses apisqa.andreani.com.",
        },
        {
          title: "Activá el operador y guardá",
          body: "Completá el CP de origen, activá «Andreani» en operadores y guardá. En checkout debe cotizar con tarifa y plazo de la API.",
        },
        {
          title: "Alta de envío y etiqueta",
          body: "Desde un pedido pagado, «Generar envío» crea la orden en Andreani y guarda tracking + link/PDF de etiqueta en el pedido.",
        },
      ] satisfies AdminSetupGuideStep[],
    } satisfies CarrierGuideCopy & Record<string, unknown>,
  },
  it: {
    save: "Salva spedizioni",
    saving: "Salvataggio...",
    saved: "Configurazione spedizioni salvata. Le modifiche valgono subito nel checkout.",
    errorFallback: "Impossibile salvare la configurazione.",
    readOnly: "Solo lettura.",
    globalTitle: "Preventivo in checkout",
    globalDescription:
      "Costo per CAP dell’acquirente. Si preventivano solo operatori con credenziali valide.",
    carriersEnabled: "Attiva preventivo per CAP in checkout",
    originZipLabel: "CAP di origine (magazzino)",
    originZipHint: "Da dove spedisci. Obbligatorio per preventivare.",
    weightLabel: "Peso default per articolo (g)",
    weightHint: "Usato per stimare il pacco nei preventivi.",
    operatorsLabel: "Operatori in checkout",
    operatorsHint:
      "Attiva quelli che vuoi offrire. Compaino solo se configurati. L’acquirente sceglie tra gli attivi.",
    missingConfigBadge: "Da configurare",
    pickupTitle: "Ritiro in sede",
    pickupDescription: "Il ritiro in sede è sempre gratuito.",
    allowPickup: "Consenti ritiro in sede",

    mercadoEnvios: {
      title: "Mercado Envíos",
      description:
        "Preventivi e spedizioni con l’API di Mercado Libre. Il token di Cobros (Mercado Pago) di solito basta.",
      accessTokenLabel: "Access Token",
      accessTokenPlaceholderNew: "TEST-... o APP_USR-...",
      accessTokenPlaceholderKeep: "Lascia vuoto per mantenere il token attuale",
      clearToken: "Rimuovi il token salvato in admin",
      mlaItemLabel: "Item MLA di riferimento (opzionale)",
      mlaItemHint:
        "Pubblicazione MLA con Mercado Envíos attivo. Migliora il preventivo reale.",
      sourceAdmin: "Token Mercado Envíos in admin",
      sourceMp: "Usando token di Mercado Pago (Cobros)",
      sourceEnv: "Configurato sul server (variabile d’ambiente)",
      sourceNone: "Senza token — non preventiva finché non lo configuri",
      guideToggle: "Guida alla configurazione di Mercado Envíos",
      guideIntro:
        "Serve un Access Token di Mercado Libre / Mercado Pago. Inizia in test (TEST-) e passa a produzione (APP_USR-) quando il preventivo funziona.",
      guideSteps: [
        {
          title: "Crea o apri l’applicazione",
          body: "Entra nel pannello sviluppatori di Mercado Libre e apri (o crea) l’app collegata al negozio.",
          link: { label: "Pannello sviluppatori", href: ML_PANEL },
        },
        {
          title: "Copia l’Access Token",
          body: "Credenziali di test o di produzione. Incolla l’Access Token sopra. Se hai già configurato Cobros, puoi lasciare vuoto: le spedizioni riusano quel token.",
          link: { label: "Credenziali", href: ML_CREDS },
        },
        {
          title: "CAP di origine e item MLA (opzionale)",
          body: "Compila il CAP del magazzino. Se hai una pubblicazione MLA con Mercado Envíos, incolla l’ID (MLA…) per migliorare il preventivo.",
          link: { label: "Docs Mercado Envíos", href: ML_SHIPPING_DOCS },
        },
        {
          title: "Attiva l’operatore e salva",
          body: "Attiva «Mercado Envíos» tra gli operatori, salva e prova il checkout con un CAP valido.",
        },
        {
          title: "Spedizione / etichetta",
          body: "Generando la spedizione dall’ordine, l’app prova a crearla via API. Se l’account non ha Mercado Envíos per creare guide, l’errore compare sull’ordine.",
        },
      ] satisfies AdminSetupGuideStep[],
    },

    correo: {
      title: "Correo Argentino (MiCorreo)",
      description:
        "Preventivo e importazione spedizioni con l’API MiCorreo. Le credenziali le fornisce Correo Argentino.",
      userLabel: "Utente MiCorreo (API)",
      passwordLabel: "Password API",
      passwordPlaceholderKeep: "Lascia vuoto per mantenere la password attuale",
      customerIdLabel: "Customer ID",
      customerIdHint: "Identificativo cliente MiCorreo (es. 0000550137).",
      sandboxLabel: "Usa ambiente di test (QA)",
      clearCredentials: "Rimuovi credenziali Correo",
      notConfigured: "Senza credenziali — non preventiva finché non le configuri",
      configured: "Credenziali salvate",
      guideToggle: "Guida alla configurazione di Correo Argentino",
      guideIntro:
        "Integrazione con l’API MiCorreo. Chiedi utente, password e customerId a un commerciale Correo. Inizia in QA.",
      guideSteps: [
        {
          title: "Richiedi le credenziali a Correo",
          body: "Contatta Correo Argentino / MiCorreo e chiedi accesso API (utente, password e customerId) per QA e poi produzione.",
          link: { label: "FAQ MiCorreo", href: MICORREO_FAQS },
        },
        {
          title: "Consulta la documentazione API",
          body: "Auth: POST /token con HTTP Basic. Preventivo: POST /rates. Ordini: endpoint MiCorreo.",
          link: { label: "Manuale API MiCorreo (PDF)", href: MICORREO_API_PDF },
        },
        {
          title: "Inserisci utente, password e Customer ID",
          body: "Incolla le credenziali sopra. Lascia attivo il test finché usi QA.",
        },
        {
          title: "CAP di origine e operatore",
          body: "Compila il CAP del magazzino, attiva «Correo Argentino» e salva.",
        },
        {
          title: "Prova preventivo e creazione spedizione",
          body: "In checkout deve comparire Correo con prezzo reale. Generando la spedizione da un ordine pagato, si crea l’ordine in MiCorreo.",
        },
      ] satisfies AdminSetupGuideStep[],
    },

    andreani: {
      title: "Andreani",
      description:
        "Preventivo, creazione spedizione ed etichetta con l’API Andreani. Servono Client ID / Secret e numero di contratto.",
      clientIdLabel: "Client ID",
      clientSecretLabel: "Client Secret",
      clientSecretPlaceholderKeep: "Lascia vuoto per mantenere il secret attuale",
      contratoLabel: "Numero di contratto",
      contratoHint: "Contratto Andreani (obbligatorio per preventivare).",
      sandboxLabel: "Usa sandbox (apisqa.andreani.com)",
      clearCredentials: "Rimuovi credenziali Andreani",
      notConfigured: "Senza credenziali — non preventiva finché non le configuri",
      configured: "Credenziali salvate",
      guideToggle: "Guida alla configurazione di Andreani",
      guideIntro:
        "Servono Client ID, Client Secret e contratto. Inizia in sandbox e passa a produzione quando preventivo ed etichette funzionano.",
      guideSteps: [
        {
          title: "Ottieni le credenziali",
          body: "PyME: portale integrazioni Andreani. Corporativi: canale commerciale. Riceverai Client ID e Client Secret.",
          link: { label: "Integrazioni PyME", href: ANDREANI_PYMES },
        },
        {
          title: "Provale nel portale sviluppatori",
          body: "Usa il sandbox per autenticazione, cotizador e ordini prima di mettere produzione qui.",
          link: { label: "Andreani Developers", href: ANDREANI_DEV },
        },
        {
          title: "Inserisci Client ID, Secret e contratto",
          body: "Incolla le credenziali e il contratto. Lascia sandbox attivo con apisqa.",
        },
        {
          title: "Attiva l’operatore e salva",
          body: "CAP di origine, attiva «Andreani» e salva. In checkout deve preventivare via API.",
        },
        {
          title: "Creazione spedizione ed etichetta",
          body: "Da un ordine pagato, «Genera spedizione» crea l’ordine Andreani e salva tracking + etichetta.",
        },
      ] satisfies AdminSetupGuideStep[],
    },
  },
} as const;

export function getShippingAdminCopy(locale: AdminLocale) {
  return shippingAdminCopy[locale] ?? shippingAdminCopy.es;
}
