import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
      <h1 className="mt-4 text-2xl font-bold">¡Compra confirmada!</h1>
      <p className="mt-2 text-neutral-600">
        Tu pedido fue procesado correctamente.
        {params.order && (
          <span className="mt-1 block text-sm">
            Número de orden: <strong>{params.order}</strong>
          </span>
        )}
      </p>
      <Link href="/productos">
        <Button className="mt-8">Seguir comprando</Button>
      </Link>
    </div>
  );
}
