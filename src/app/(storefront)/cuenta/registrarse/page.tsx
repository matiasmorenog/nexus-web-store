import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerRegisterForm } from "@/components/storefront/customer-auth-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { auth } from "@/lib/auth";

export default async function CustomerRegisterPage() {
  const session = await auth();

  if (session?.user?.role === "CUSTOMER") {
    redirect("/cuenta/pedidos");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title="Crear cuenta"
        description="Registrate para seguir tus pedidos en un solo lugar."
        backHref="/cuenta/ingresar"
        backLabel="Ya tengo cuenta"
      />
      <div className="mt-8 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-sm">
        <CustomerRegisterForm />
      </div>
      <p className="mt-6 text-center text-xs text-neutral-500">
        Podés comprar sin cuenta.{" "}
        <Link href="/" className="text-[var(--brand-primary)] hover:underline">
          Seguir comprando
        </Link>
      </p>
    </div>
  );
}
