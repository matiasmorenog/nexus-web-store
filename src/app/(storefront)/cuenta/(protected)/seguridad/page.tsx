import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { StorefrontPageHeader } from "@/components/storefront/storefront-page-header";

export default function CustomerSecurityPage() {
  return (
    <div>
      <StorefrontPageHeader
        variant="account"
        title="Seguridad"
        description="Cambiá tu contraseña cuando quieras."
      />
      <ChangePasswordForm variant="account" />
    </div>
  );
}
