import Link from "next/link";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { ForgotPasswordForm } from "@/components/storefront/forgot-password-form";

export default function AdminForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title="Recuperar contraseña"
        description="Te enviamos un enlace por email para restablecer el acceso al panel."
        backHref="/admin/login"
        backLabel="Volver al login admin"
      />
      <div className="mt-8 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-sm">
        <ForgotPasswordForm loginHref="/admin/login" />
      </div>
      <p className="mt-6 text-center text-xs text-neutral-500">
        ¿Sos cliente?{" "}
        <Link
          href="/cuenta/recuperar-contrasena"
          className="text-[var(--brand-primary)] hover:underline"
        >
          Recuperar cuenta de cliente
        </Link>
      </p>
    </div>
  );
}
