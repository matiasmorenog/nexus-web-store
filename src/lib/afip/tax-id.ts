/** Normaliza CUIT/CUIL/DNI a solo dígitos (7–11). Devuelve null si no es válido. */
export function normalizeTaxId(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;

  const digits = raw.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 11) {
    return null;
  }

  return digits;
}

export function formatTaxIdDisplay(taxId: string | null | undefined): string | null {
  if (!taxId) return null;
  if (taxId.length === 11) {
    return `${taxId.slice(0, 2)}-${taxId.slice(2, 10)}-${taxId.slice(10)}`;
  }
  return taxId;
}
