export function isResendConfigured() {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes("your-") && key.startsWith("re_"));
}

export function getFromAddress() {
  return process.env.EMAIL_FROM ?? "Tienda <onboarding@resend.dev>";
}

export function logDemoEmail(label: string, to: string, subject: string, text: string) {
  const border = "─".repeat(50);
  console.log(
    `\n${border}\n[DEMO EMAIL] ${label}\nTo: ${to}\nSubject: ${subject}\n${border}\n${text}\n${border}\n`,
  );
}
