import { cookies } from "next/headers";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminLocaleSwitcher } from "@/components/admin/admin-locale-switcher";
import { requireAdminPermission } from "@/lib/admin-session";
import {
  ADMIN_LOCALE_COOKIE,
  parseAdminLocale,
} from "@/lib/admin-locale";

export const dynamic = "force-dynamic";

export default async function AdminLanguageSettingsPage() {
  await requireAdminPermission("config:view");
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);

  return (
    <div className="space-y-6">
      <AdminDashboardReveal index={0}>
        <AdminCard className="max-w-lg">
          <AdminLocaleSwitcher
            locale={locale}
            tone="light"
            showLabel={false}
            appearance="segmented"
            className="px-0"
          />
        </AdminCard>
      </AdminDashboardReveal>
    </div>
  );
}
