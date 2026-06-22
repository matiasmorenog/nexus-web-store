import { Resend } from "resend";
import {
  buildFromAddress,
  isResendConfigured,
  logDemoEmail,
} from "@/lib/emails/email-utils";

export type ContactEmailData = {
  storeName: string;
  name: string;
  email: string;
  message: string;
};

function buildContactEmail(data: ContactEmailData, merchantEmail: string) {
  const subject = `Consulta desde ${data.storeName} — ${data.name}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#171717;">
      <h1 style="font-size:22px;margin-bottom:8px;">Nueva consulta de contacto</h1>
      <p>Recibiste un mensaje desde el formulario de <strong>${data.storeName}</strong>.</p>
      <h2 style="font-size:16px;margin-top:24px;">Datos del cliente</h2>
      <p style="margin:0;">
        <strong>Nombre:</strong> ${data.name}<br>
        <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a>
      </p>
      <h2 style="font-size:16px;margin-top:24px;">Mensaje</h2>
      <p style="margin:0;white-space:pre-wrap;">${data.message}</p>
      <p style="margin-top:24px;color:#666;font-size:13px;">
        Podés responder directamente a este email; la respuesta irá al cliente.
      </p>
    </div>
  `;

  const text = [
    `Nueva consulta en ${data.storeName}`,
    "",
    `Nombre: ${data.name}`,
    `Email: ${data.email}`,
    "",
    "Mensaje:",
    data.message,
  ].join("\n");

  return { to: merchantEmail, subject, html, text };
}

export async function sendContactEmail(
  data: ContactEmailData,
  merchantEmail: string,
): Promise<{ mode: "sent" | "demo-log" }> {
  const email = buildContactEmail(data, merchantEmail);
  const from = buildFromAddress(data.storeName, merchantEmail);

  if (!isResendConfigured()) {
    logDemoEmail("Consulta de contacto", from, email.to, email.subject, email.text);
    return { mode: "demo-log" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from,
    to: merchantEmail,
    replyTo: data.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (result.error) {
    throw new Error(`Email de contacto falló: ${result.error.message}`);
  }

  return { mode: "sent" };
}
