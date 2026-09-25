import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/storefront/customer-auth-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { resolveCustomerCallbackUrl } from "@/lib/customer-auth-redirect";
import {
  SEED_CUSTOMER_EMAIL,
  SEED_CUSTOMER_PASSWORD,
} from "@/lib/demo-customer-credentials";
import { auth } from "@/lib/auth";
import { isAdminRole, isGoogleAuthEnabled } from "@/lib/auth-session";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";

type PageProps = {
  searchParams: Promise<{
    reset?: string;
    callbackUrl?: string;
    error?: string;
  }>;
};

function getCustomerLoginError(error?: string) {
  const copy = getLocaleCopy();
  if (error === "google_admin") return copy.adminAccountError;
  if (error === "OAuthAccountNotLinked") return copy.googleLinkError;
  return null;
}

export default async function CustomerLoginPage({ searchParams }: PageProps) {
  const { reset, callbackUrl, error } = await searchParams;
  const session = await auth();
  const redirectTo = resolveCustomerCallbackUrl(callbackUrl);
  const loginError = getCustomerLoginError(error);
  const copy = getLocaleCopy();

  if (session?.user?.role === "CUSTOMER") {
    redirect(redirectTo);
  }

  if (session?.user?.role && isAdminRole(session.user.role)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <StorefrontPageHeader
        title={copy.signInTitle}
        description={copy.signInDescription}
        backHref="/"
        backLabel={copy.backToStore}
      />
      <div className="mt-8 storefront-card border border-neutral-200/90 bg-white p-6 shadow-sm">
        {reset === "1" ? (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            {copy.passwordUpdated}
          </p>
        ) : null}
        {loginError ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {loginError}
          </p>
        ) : null}
        <CustomerLoginForm
          callbackUrl={redirectTo}
          defaultEmail={
            process.env.NODE_ENV === "development" ? SEED_CUSTOMER_EMAIL : ""
          }
          defaultPassword={
            process.env.NODE_ENV === "development" ? SEED_CUSTOMER_PASSWORD : ""
          }
          googleAuthEnabled={isGoogleAuthEnabled()}
        />
      </div>
    </div>
  );
}
