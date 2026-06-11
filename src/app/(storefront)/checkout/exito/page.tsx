import { CheckCircle } from "lucide-react";
import { StorefrontStatusPage } from "@/components/storefront/storefront-status-page";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;

  return (
    <StorefrontStatusPage
      icon={CheckCircle}
      iconClassName="text-green-600"
      title="¡Compra confirmada!"
      actionHref="/productos"
      actionLabel="Seguir comprando"
    >
      <p>Tu pedido fue procesado correctamente.</p>
      {params.order ? (
        <p>
          Número de orden: <strong className="text-neutral-900">{params.order}</strong>
        </p>
      ) : null}
      <p>Te enviamos un email con el detalle de tu compra.</p>
    </StorefrontStatusPage>
  );
}
