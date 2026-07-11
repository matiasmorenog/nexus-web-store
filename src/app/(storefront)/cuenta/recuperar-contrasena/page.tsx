import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { ForgotPasswordForm } from "@/components/storefront/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title="Recuperar contraseña"
        description="Te enviamos un enlace por email para elegir una nueva contraseña."
        backHref="/cuenta/ingresar"
        backLabel="Volver a ingresar"
      />
      <div className="mt-8 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
