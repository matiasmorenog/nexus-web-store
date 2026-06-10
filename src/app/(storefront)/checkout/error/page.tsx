import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutErrorPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <XCircle className="mx-auto h-16 w-16 text-red-600" />
      <h1 className="mt-4 text-2xl font-bold">Pago no completado</h1>
      <p className="mt-2 text-neutral-600">
        Hubo un problema con el pago. Podés intentar nuevamente.
      </p>
      <Link href="/checkout">
        <Button className="mt-8">Volver al checkout</Button>
      </Link>
    </div>
  );
}
