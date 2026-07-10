export function isValidMercadoPagoAccessToken(token: string): boolean {
  const trimmed = token.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.includes("your-access-token")) return false;
  return /^(TEST-|APP_USR-)/.test(trimmed);
}

export function maskMercadoPagoAccessToken(token: string): string {
  const prefix = token.startsWith("TEST-")
    ? "TEST-"
    : token.startsWith("APP_USR-")
      ? "APP_USR-"
      : token.slice(0, 8);
  const suffix = token.slice(-4);
  return `${prefix}****${suffix}`;
}

export function getEnvMercadoPagoAccessToken(): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token || !isValidMercadoPagoAccessToken(token)) {
    return null;
  }

  return token;
}
