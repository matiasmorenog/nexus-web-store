import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerRegisterForm } from "@/components/storefront/customer-auth-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { auth } from "@/lib/auth";
import { isAdminRole, isGoogleAuthEnabled } from "@/lib/auth-session";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

function getRegisterError(error?: string) {
  if (error === "google_admin") {
    return "Esta cuenta es de administración. Usá el panel admin.";
  }
  if (error === "OAuthAccountNotLinked") {
    return "No se pudo vincular tu cuenta de Google.";
  }
  return null;
}

export default async function CustomerRegisterPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const session = await auth();
  const registerError = getRegisterError(error);

  if (session?.user?.role === "CUSTOMER") {
    redirect("/cuenta/pedidos");
  }

  if (session?.user?.role && isAdminRole(session.user.role)) {
    redirect("/admin");
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
        {registerError ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {registerError}
          </p>
        ) : null}
        <CustomerRegisterForm googleAuthEnabled={isGoogleAuthEnabled()} />
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
