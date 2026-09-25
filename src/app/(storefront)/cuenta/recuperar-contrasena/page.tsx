import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { ForgotPasswordForm } from "@/components/storefront/forgot-password-form";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { storefrontPath } from "@/lib/storefront-paths";

export default function ForgotPasswordPage() {
  const copy = getLocaleCopy();

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title={copy.forgotTitle}
        description={copy.forgotDescription}
        backHref={storefrontPath("signIn")}
        backLabel={copy.backToSignIn}
      />
      <div className="mt-8 storefront-card border border-neutral-200/90 bg-white p-6 shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
