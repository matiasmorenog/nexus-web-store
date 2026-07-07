/** Dígitos para wa.me (sin +, espacios ni guiones). */
export function normalizeWhatsAppPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isValidWhatsAppPhone(phone: string): boolean {
  const digits = normalizeWhatsAppPhone(phone);
  return digits.length >= 10 && digits.length <= 15;
}

export function buildWhatsAppUrl(phone: string, message?: string | null): string {
  const digits = normalizeWhatsAppPhone(phone);
  const base = `https://wa.me/${digits}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function normalizeMetaPixelId(raw: string): string {
  return raw.trim();
}

export function isValidMetaPixelId(pixelId: string): boolean {
  return /^\d{8,20}$/.test(pixelId);
}
