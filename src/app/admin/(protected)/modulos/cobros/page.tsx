import { headers } from "next/headers";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPaymentSettingsForm } from "@/components/admin/admin-payment-settings-form";
import { AdminStripePaymentForm } from "@/components/admin/admin-stripe-payment-form";
import { AdminTransferPaymentForm } from "@/components/admin/admin-transfer-payment-form";
import { requireAdminSession } from "@/lib/admin-session";
import { storeHidesMercadoPago } from "@/lib/modules";
import { getStorePaymentSettingsForAdmin } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

async function resolveSiteOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "";
}

export default async function AdminCobrosPage() {
  const session = await requireAdminSession();
  const hideMercadoPago = storeHidesMercadoPago();

  const paymentSettings = await getStorePaymentSettingsForAdmin(session.user.storeId);
  const webhookUrl = `${await resolveSiteOrigin()}/api/webhooks/stripe`;

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Cobros"
          description={
            hideMercadoPago
              ? "Tarjeta (Stripe), bonifico bancario (IBAN) y métodos de pago en checkout."
              : "Mercado Pago, tarjeta (Stripe), transferencia con descuento y métodos de pago en checkout."
          }
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <div className="space-y-6">
          {hideMercadoPago ? null : (
            <AdminPaymentSettingsForm initialSettings={paymentSettings} />
          )}
          <AdminStripePaymentForm
            initialSettings={{
              stripeEnabled: paymentSettings.stripeEnabled,
              stripeSecretKeyHint: paymentSettings.stripeSecretKeyHint,
              stripeWebhookSecretConfigured: paymentSettings.stripeWebhookSecretConfigured,
            }}
            webhookUrl={webhookUrl}
          />
          <AdminTransferPaymentForm
            initialSettings={{
              transferEnabled: paymentSettings.transferEnabled,
              transferInstructions: paymentSettings.transferInstructions,
            }}
          />
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
