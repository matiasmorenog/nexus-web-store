import { cookies } from "next/headers";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminLocaleSwitcher } from "@/components/admin/admin-locale-switcher";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ChangePasswordForm } from "@/components/shared/change-password-form";
import { requireAdminPermission } from "@/lib/admin-session";
import { ADMIN_LOCALE_COOKIE, adminChrome, parseAdminLocale } from "@/lib/admin-locale";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdminPermission("config:view");
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  const copy = adminChrome[locale];

  return (
    <div className="space-y-6">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Configuración"
          description="Seguridad de tu cuenta admin."
        />
      </AdminDashboardReveal>
      <AdminDashboardReveal index={1}>
        <AdminCard
          title={copy.language}
          description={copy.languageHint}
          className="max-w-lg"
        >
          <AdminLocaleSwitcher
            locale={locale}
            tone="light"
            showLabel={false}
            appearance="segmented"
            className="px-0"
          />
        </AdminCard>
      </AdminDashboardReveal>
      <AdminDashboardReveal index={2}>
        <ChangePasswordForm variant="admin" />
      </AdminDashboardReveal>
    </div>
  );
}
