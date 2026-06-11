import { Resend } from "resend";
import {
  buildCustomerConfirmationEmail,
  buildMerchantNotificationEmail,
  type OrderEmailData,
} from "@/lib/emails/order-email-data";

type SendResult = {
  mode: "sent" | "demo-log";
  customer: { to: string; subject: string };
  merchant: { to: string; subject: string };
};

function isResendConfigured() {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes("your-") && key.startsWith("re_"));
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM ??
    "Alaska Indumentaria <onboarding@resend.dev>"
  );
}

function logDemoEmail(label: string, to: string, subject: string, text: string) {
  const border = "─".repeat(50);
  console.log(`\n${border}\n[DEMO EMAIL] ${label}\nTo: ${to}\nSubject: ${subject}\n${border}\n${text}\n${border}\n`);
}

export async function sendOrderEmails(
  data: OrderEmailData,
  merchantEmail: string,
): Promise<SendResult> {
  const customerEmail = buildCustomerConfirmationEmail(data);
  const merchantNotification = buildMerchantNotificationEmail(data);

  const result: SendResult = {
    mode: "demo-log",
    customer: { to: data.customerEmail, subject: customerEmail.subject },
    merchant: { to: merchantEmail, subject: merchantNotification.subject },
  };

  if (!isResendConfigured()) {
    logDemoEmail("Cliente", data.customerEmail, customerEmail.subject, customerEmail.text);
    logDemoEmail("Comerciante", merchantEmail, merchantNotification.subject, merchantNotification.text);
    return result;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = getFromAddress();

  const [customerResult, merchantResult] = await Promise.all([
    resend.emails.send({
      from,
      to: data.customerEmail,
      subject: customerEmail.subject,
      html: customerEmail.html,
      text: customerEmail.text,
    }),
    resend.emails.send({
      from,
      to: merchantEmail,
      subject: merchantNotification.subject,
      html: merchantNotification.html,
      text: merchantNotification.text,
    }),
  ]);

  if (customerResult.error) {
    throw new Error(`Email al cliente falló: ${customerResult.error.message}`);
  }
  if (merchantResult.error) {
    throw new Error(`Email al comerciante falló: ${merchantResult.error.message}`);
  }

  result.mode = "sent";
  return result;
}
