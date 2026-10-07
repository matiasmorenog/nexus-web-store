export function isValidStripeSecretKey(key: string): boolean {
  const trimmed = key.trim();
  return trimmed.length >= 20 && /^(sk|rk)_(test|live)_/.test(trimmed);
}

export function isValidStripeWebhookSecret(secret: string): boolean {
  const trimmed = secret.trim();
  return trimmed.length >= 20 && trimmed.startsWith("whsec_");
}

export function maskStripeSecretKey(key: string): string {
  const match = key.match(/^(sk|rk)_(test|live)_/);
  const prefix = match ? match[0] : key.slice(0, 8);
  return `${prefix}****${key.slice(-4)}`;
}
