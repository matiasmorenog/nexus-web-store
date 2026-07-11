import { Resend } from "resend";
import {
  buildFromAddress,
  isResendConfigured,
  logDemoEmail,
} from "@/lib/emails/email-utils";

type PasswordResetEmailData = {
  storeName: string;
  recipientEmail: string;
  resetUrl: string;
};

function buildPasswordResetEmail(data: PasswordResetEmailData) {
  const subject = `Restablecer contraseña — ${data.storeName}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#171717;">
      <h1 style="font-size:22px;margin-bottom:8px;">Restablecer contraseña</h1>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${data.storeName}</strong>.</p>
      <p style="margin:24px 0;">
        <a href="${data.resetUrl}" style="display:inline-block;background:#171717;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
          Elegir nueva contraseña
        </a>
      </p>
      <p style="color:#666;font-size:14px;">El enlace vence en 1 hora. Si no pediste este cambio, podés ignorar este email.</p>
      <p style="color:#666;font-size:13px;word-break:break-all;">${data.resetUrl}</p>
    </div>
  `;

  const text = [
    `Restablecer contraseña — ${data.storeName}`,
    "",
    "Usá este enlace para elegir una nueva contraseña (vence en 1 hora):",
    data.resetUrl,
    "",
    "Si no pediste este cambio, ignorá este mensaje.",
  ].join("\n");

  return { subject, html, text };
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
  merchantEmail: string,
): Promise<{ mode: "sent" | "demo-log" }> {
  const email = buildPasswordResetEmail(data);
  const from = buildFromAddress(data.storeName, merchantEmail);

  if (!isResendConfigured()) {
    logDemoEmail(
      "Restablecer contraseña",
      from,
      data.recipientEmail,
      email.subject,
      email.text,
    );
    return { mode: "demo-log" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to: data.recipientEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (result.error) {
    throw new Error(`Email de restablecimiento falló: ${result.error.message}`);
  }

  return { mode: "sent" };
}
