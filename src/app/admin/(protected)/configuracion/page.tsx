import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { requireAdminPermission } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPermission("config:view");

  return (
    <div>
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Configuración"
          description="Seguridad de tu cuenta admin."
        />
      </AdminDashboardReveal>
      <AdminDashboardReveal index={1}>
        <ChangePasswordForm variant="admin" />
      </AdminDashboardReveal>
    </div>
  );
}
