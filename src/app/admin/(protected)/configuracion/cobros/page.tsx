import { headers } from "next/headers";
import { AdminCashPaymentForm } from "@/components/admin/admin-cash-payment-form";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
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
  const siteOrigin = await resolveSiteOrigin();
  const stripeWebhookUrl = `${siteOrigin}/api/webhooks/stripe`;
  const mercadoPagoWebhookUrl = `${siteOrigin}/api/webhooks/mercadopago`;

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <div className="space-y-6">
          {hideMercadoPago ? null : (
            <AdminPaymentSettingsForm
              initialSettings={paymentSettings}
              webhookUrl={mercadoPagoWebhookUrl}
            />
          )}
          <AdminStripePaymentForm
            initialSettings={{
              stripeEnabled: paymentSettings.stripeEnabled,
              stripeSecretKeyHint: paymentSettings.stripeSecretKeyHint,
              stripeWebhookSecretConfigured:
                paymentSettings.stripeWebhookSecretConfigured,
            }}
            webhookUrl={stripeWebhookUrl}
          />
          <AdminTransferPaymentForm
            initialSettings={{
              transferEnabled: paymentSettings.transferEnabled,
              transferInstructions: paymentSettings.transferInstructions,
              transferDiscountEnabled: paymentSettings.transferDiscountEnabled,
            }}
          />
          {hideMercadoPago ? (
            <AdminCashPaymentForm initialEnabled={paymentSettings.cashEnabled} />
          ) : null}
        </div>
      </AdminDashboardReveal>
    </div>
  );
}
