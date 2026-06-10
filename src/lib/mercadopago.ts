import { MercadoPagoConfig, Preference } from "mercadopago";

function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured");
  }

  return new MercadoPagoConfig({ accessToken });
}

export async function createPaymentPreference({
  orderId,
  items,
  payerEmail,
  payerName,
}: {
  orderId: string;
  items: Array<{ id: string; title: string; quantity: number; unit_price: number }>;
  payerEmail: string;
  payerName: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const preference = new Preference(getClient());

  const result = await preference.create({
    body: {
      items,
      payer: {
        email: payerEmail,
        name: payerName,
      },
      external_reference: orderId,
      back_urls: {
        success: `${appUrl}/checkout/exito`,
        failure: `${appUrl}/checkout/error`,
        pending: `${appUrl}/checkout/pendiente`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    },
  });

  return result;
}
