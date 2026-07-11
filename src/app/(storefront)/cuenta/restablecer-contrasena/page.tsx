import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { ResetPasswordForm } from "@/components/storefront/reset-password-form";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token = "" } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title="Nueva contraseña"
        description="Elegí una contraseña nueva para tu cuenta."
        backHref="/cuenta/ingresar"
        backLabel="Volver a ingresar"
      />
      <div className="mt-8 rounded-xl border border-neutral-200/90 bg-white p-6 shadow-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
