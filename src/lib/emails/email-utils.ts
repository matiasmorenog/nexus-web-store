export function isResendConfigured() {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes("your-") && key.startsWith("re_"));
}

/** Remitente transaccional: nombre de tienda + email del owner (DB). */
export function buildFromAddress(storeName: string, ownerEmail: string) {
  const safeName = storeName.replace(/"/g, "'");
  return `${safeName} <${ownerEmail}>`;
}

export function logDemoEmail(
  label: string,
  from: string,
  to: string,
  subject: string,
  text: string,
) {
  const border = "─".repeat(50);
  console.log(
    `\n${border}\n[DEMO EMAIL] ${label}\nFrom: ${from}\nTo: ${to}\nSubject: ${subject}\n${border}\n${text}\n${border}\n`,
  );
}
