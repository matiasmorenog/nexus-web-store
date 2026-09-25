function envFlagOn(raw: string | undefined): boolean {
  const value = raw?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

/** Production deploys never expose passwordless demo login. */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Server: provider `demo`.
 * On in `next dev`. On preview only with DEMO_LOGIN_ENABLED=1.
 * Off on Vercel Production.
 */
export function isDemoLoginEnabled(): boolean {
  if (isVercelProduction()) return false;
  if (process.env.NODE_ENV === "development") return true;
  return envFlagOn(process.env.DEMO_LOGIN_ENABLED);
}

/** Client: the "Inicio demo" block. */
export function isDemoLoginUiEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return envFlagOn(process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED);
}
