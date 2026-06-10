import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPendingPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <Clock className="mx-auto h-16 w-16 text-yellow-600" />
      <h1 className="mt-4 text-2xl font-bold">Pago pendiente</h1>
      <p className="mt-2 text-neutral-600">
        Tu pago está siendo procesado. Te notificaremos cuando se confirme.
      </p>
      <Link href="/">
        <Button className="mt-8">Volver al inicio</Button>
      </Link>
    </div>
  );
}
