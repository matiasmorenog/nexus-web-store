import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { ResetPasswordForm } from "@/components/storefront/reset-password-form";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";
import { storefrontPath } from "@/lib/storefront-paths";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token = "" } = await searchParams;
  const copy = getLocaleCopy();

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title={copy.resetTitle}
        description={copy.resetDescription}
        backHref={storefrontPath("signIn")}
        backLabel={copy.backToSignIn}
      />
      <div className="mt-8 storefront-card border border-neutral-200/90 bg-white p-6 shadow-sm">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
