function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/** Slug de la tienda activa (multi-tenant listo; hoy una sola vía env). */
export function getDefaultStoreSlug(): string {
  const slug = readEnv("DEFAULT_STORE_SLUG");
  if (!slug) {
    throw new Error(
      "DEFAULT_STORE_SLUG es obligatorio. Configuralo en .env (ver .env.example).",
    );
  }
  return slug;
}

/** Email público de contacto (página /contacto y formulario). */
export function getContactEmail(): string {
  const email =
    readEnv("NEXT_PUBLIC_CONTACT_EMAIL") ?? readEnv("STORE_NOTIFICATION_EMAIL");
  if (!email) {
    throw new Error(
      "Configurá NEXT_PUBLIC_CONTACT_EMAIL o STORE_NOTIFICATION_EMAIL.",
    );
  }
  return email;
}

/** Prellenado opcional del login admin en desarrollo (NEXT_PUBLIC_*). */
export function getAdminDemoEmail(): string {
  return readEnv("NEXT_PUBLIC_ADMIN_DEMO_EMAIL") ?? "";
}
