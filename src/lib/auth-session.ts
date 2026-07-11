export const AUTH_CONTEXT_COOKIE = "auth_context";
export const AUTH_REMEMBER_COOKIE = "auth_remember";

/** 1 day — customer default session */
export const CUSTOMER_SESSION_MAX_AGE = 24 * 60 * 60;
/** 30 days — remember me (customer + admin) */
export const REMEMBER_SESSION_MAX_AGE = 30 * 24 * 60 * 60;
/** 8 hours — admin default session */
export const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

export type AuthLoginContext = "customer" | "customer_register" | "admin";

export function isCustomerAuthContext(
  context: string,
): context is "customer" | "customer_register" {
  return context === "customer" || context === "customer_register";
}

export function customerAuthErrorPath(context: AuthLoginContext) {
  return context === "customer_register"
    ? "/cuenta/registrarse"
    : "/cuenta/ingresar";
}

export function sessionContextForAuth(
  context: AuthLoginContext,
): "customer" | "admin" {
  return context === "admin" ? "admin" : "customer";
}

export function isGoogleAuthEnabled() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

export function isAdminRole(role: string) {
  return (
    role === "STORE_OWNER" ||
    role === "STORE_STAFF" ||
    role === "PLATFORM_ADMIN"
  );
}
