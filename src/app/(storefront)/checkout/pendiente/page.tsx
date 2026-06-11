import { Clock } from "lucide-react";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";

export default function CheckoutPendingPage() {
  return (
    <StorefrontStatusPage
      icon={Clock}
      iconClassName="text-amber-600"
      title="Pago pendiente"
      actionHref="/"
      actionLabel="Volver al inicio"
      actionVariant="secondary"
    >
      <p>Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
    </StorefrontStatusPage>
  );
}
