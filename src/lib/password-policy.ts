/** NIST SP 800-63B floor; shared by customer + admin password forms/APIs. */
export const PASSWORD_MIN_LENGTH = 8;

export function passwordTooShortMessage(locale: "es" | "it" = "es"): string {
  if (locale === "it") {
    return `La password deve avere almeno ${PASSWORD_MIN_LENGTH} caratteri`;
  }
  return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
}

export function passwordMinHint(locale: "es" | "it" = "es"): string {
  if (locale === "it") {
    return `Minimo ${PASSWORD_MIN_LENGTH} caratteri`;
  }
  return `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`;
}

export function validatePasswordLength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return passwordTooShortMessage("es");
  }
  return null;
}
