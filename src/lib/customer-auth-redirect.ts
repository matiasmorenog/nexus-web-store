const CUSTOMER_LOGIN_PATH = "/cuenta/ingresar";

const CUSTOMER_AUTH_PATHS = new Set([
  CUSTOMER_LOGIN_PATH,
  "/cuenta/registrarse",
  "/cuenta/recuperar-contrasena",
  "/cuenta/restablecer-contrasena",
]);

/** Safe internal redirect after customer login. Defaults to home. */
export function resolveCustomerCallbackUrl(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "/";

  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";

  const pathOnly = trimmed.split("?")[0]?.split("#")[0] ?? "/";
  if (CUSTOMER_AUTH_PATHS.has(pathOnly)) return "/";

  return trimmed.split("#")[0] ?? "/";
}

export function buildCustomerLoginHref(callbackPath?: string | null): string {
  const callback = resolveCustomerCallbackUrl(callbackPath);
  if (callback === "/") {
    return CUSTOMER_LOGIN_PATH;
  }
  return `${CUSTOMER_LOGIN_PATH}?callbackUrl=${encodeURIComponent(callback)}`;
}

/** Best-effort current path for server redirects to login (protected routes). */
export async function getCustomerAuthCallbackFromHeaders(): Promise<
  string | undefined
> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const candidates = [
    h.get("x-middleware-request-url"),
    h.get("x-url"),
    h.get("next-url"),
    h.get("x-invoke-path"),
  ];

  for (const value of candidates) {
    if (!value) continue;

    try {
      const parsed = value.startsWith("http")
        ? new URL(value)
        : new URL(value.startsWith("/") ? value : `/${value}`, "http://localhost");
      const path = `${parsed.pathname}${parsed.search}`;
      const resolved = resolveCustomerCallbackUrl(path);
      if (resolved !== "/") return resolved;
    } catch {
      continue;
    }
  }

  return undefined;
}
