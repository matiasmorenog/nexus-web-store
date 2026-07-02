import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/storefront/customer-auth-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { auth } from "@/lib/auth";

export default async function CustomerLoginPage() {
  const session = await auth();

  if (session?.user?.role === "CUSTOMER") {
    redirect("/cuenta/pedidos");
  }

  if (session?.user?.role === "STORE_OWNER" || session?.user?.role === "PLATFORM_ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title="Ingresar"
        description="Accedé a tu cuenta para ver el historial de pedidos."
        backHref="/"
        backLabel="Volver a la tienda"
      />
      <div className="mt-8 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-sm">
        <CustomerLoginForm />
      </div>
      <p className="mt-6 text-center text-xs text-neutral-500">
        ¿Sos el dueño de la tienda?{" "}
        <Link href="/admin/login" className="text-[var(--brand-primary)] hover:underline">
          Panel admin
        </Link>
      </p>
    </div>
  );
}
