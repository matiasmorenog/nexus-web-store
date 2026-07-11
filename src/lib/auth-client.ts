"use client";

import type { AuthLoginContext } from "@/lib/auth-session";

const COOKIE_MAX_AGE_SECONDS = 600;

export function setAuthIntentCookies(
  context: AuthLoginContext,
  rememberMe: boolean,
) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  const base = `path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure ? "; Secure" : ""}`;
  document.cookie = `auth_context=${context}; ${base}`;
  document.cookie = `auth_remember=${rememberMe ? "1" : "0"}; ${base}`;
}
