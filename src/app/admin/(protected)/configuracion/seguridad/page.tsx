import { cookies } from "next/headers";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { requireAdminPermission } from "@/lib/admin-session";
import {
  ADMIN_LOCALE_COOKIE,
  adminChrome,
  parseAdminLocale,
} from "@/lib/admin-locale";

export const dynamic = "force-dynamic";

export default async function AdminSecuritySettingsPage() {
  await requireAdminPermission("config:view");
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  const copy = adminChrome[locale];

  return (
    <div className="space-y-6">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title={copy.security}
          description={copy.securityHint}
        />
      </AdminDashboardReveal>
      <AdminDashboardReveal index={1}>
        <ChangePasswordForm variant="admin" />
      </AdminDashboardReveal>
    </div>
  );
}
