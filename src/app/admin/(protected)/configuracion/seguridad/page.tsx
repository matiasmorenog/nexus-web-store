import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { requireAdminPermission } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export default async function AdminSecuritySettingsPage() {
  await requireAdminPermission("config:view");

  return (
    <div className="space-y-6">
      <AdminDashboardReveal index={0}>
        <ChangePasswordForm variant="admin" />
      </AdminDashboardReveal>
    </div>
  );
}
