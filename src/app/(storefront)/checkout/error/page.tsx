import { XCircle } from "lucide-react";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";

export default function CheckoutErrorPage() {
  return (
    <StorefrontStatusPage
      icon={XCircle}
      iconClassName="text-red-600"
      title="Pago no completado"
      actionHref="/checkout"
      actionLabel="Volver al checkout"
    >
      <p>Hubo un problema con el pago. Podés intentar nuevamente.</p>
    </StorefrontStatusPage>
  );
}
