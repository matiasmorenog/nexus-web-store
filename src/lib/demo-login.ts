import { getDemoPersonaById } from "@/lib/demo-personas";

function envFlagOn(raw: string | undefined): boolean {
  const value = raw?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function databaseHost(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  try {
    const withProtocol = url.replace(/^postgresql:/i, "http:");
    return new URL(withProtocol).hostname.toLowerCase();
  } catch {
    return null;
  }
}

const PROD_HOST_MARKERS = [
  ...(process.env.NEON_PROD_HOST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  ...(process.env.PRODUCTION_DATABASE_HOST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
];

/** Fail closed if DATABASE_URL looks like Neon production / main. */
export function isProductionDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL?.trim().toLowerCase() ?? "";
  const host = databaseHost();
  if (url.includes("branch=main") || url.includes("branch%3dmain")) {
    return true;
  }
  if (!host) return false;
  return PROD_HOST_MARKERS.some((marker) => host.includes(marker));
}

/** Production deploys never expose passwordless demo login. */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Server: provider `demo`.
 * On in `next dev`. On preview only with DEMO_LOGIN_ENABLED=1.
 * Off on Vercel Production and when DATABASE_URL looks like Neon main.
 */
export function isDemoLoginEnabled(): boolean {
  if (isVercelProduction()) return false;
  if (isProductionDatabaseUrl()) return false;
  if (process.env.NODE_ENV === "development") return true;
  return envFlagOn(process.env.DEMO_LOGIN_ENABLED);
}

/** Client: the "Inicio demo" block. */
export function isDemoLoginUiEnabled(): boolean {
  if (isVercelProduction()) return false;
  if (process.env.NODE_ENV === "development") return true;
  return envFlagOn(process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED);
}

export function assertDemoPersonaAllowed(personaId: string): void {
  if (!isDemoLoginEnabled()) {
    throw new Error("Demo login disabled");
  }
  if (!getDemoPersonaById(personaId)) {
    throw new Error("Unknown demo persona");
  }
}
