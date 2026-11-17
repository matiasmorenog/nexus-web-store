/**
 * Shared helpers for Goat (`demo-store`) demo seed + date refresh.
 * Web analytics / tráfico is Vercel API-only — not seeded here.
 */

import { DEFAULT_STORE_SLUG } from "./seed-env";

export const GOAT_DEMO_STORE_SLUG = DEFAULT_STORE_SLUG;

export const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

/** Demo customer emails for wishlist accounts (password = SEED_CUSTOMER_PASSWORD). */
export const GOAT_DEMO_WISHLIST_USERS = [
  {
    email: "martin.gomez@demo.nexus-store.local",
    name: "Martín Gómez",
  },
  {
    email: "valentina.ruiz@demo.nexus-store.local",
    name: "Valentina Ruiz",
  },
  {
    email: "camila.acosta@demo.nexus-store.local",
    name: "Camila Acosta",
  },
] as const;

export function argentinaYmd(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Local midnight for an Argentina calendar day (stable for seed/refresh). */
export function startOfDayArgentina(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  // Approximate AR midnight as UTC-3 noon-of-previous? Prefer fixed UTC-3 offset.
  return new Date(Date.UTC(y!, m! - 1, d!, 3, 0, 0)); // 00:00 AR (UTC-3)
}

export function startOfTodayArgentina(now = new Date()): Date {
  return startOfDayArgentina(argentinaYmd(now));
}

export function startOfDayLocal(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Shift so the newest order day lands on "today" (Argentina).
 * Returns 0 when already aligned (within same calendar day).
 */
export function computeDemoDateDeltaMs(
  maxCreatedAt: Date,
  now = new Date(),
): number {
  const today = startOfTodayArgentina(now);
  const maxDay = startOfDayLocal(maxCreatedAt);
  return today.getTime() - maxDay.getTime();
}

export function addMs(date: Date, deltaMs: number): Date {
  return new Date(date.getTime() + deltaMs);
}
