import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";
import { getLocaleCopy } from "@/lib/storefront-locale-copy";

export default function CustomerSecurityPage() {
  const copy = getLocaleCopy();

  return (
    <div>
      <StorefrontPageHeader
        variant="account"
        title={copy.securityTitle}
        description={copy.securityDescription}
      />
      <ChangePasswordForm variant="account" />
    </div>
  );
}
