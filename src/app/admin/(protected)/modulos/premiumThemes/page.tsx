import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminThemeSettingsForm } from "@/components/admin/admin-theme-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminModuleView } from "@/lib/admin-session";

import { getStoreThemeSettingsForAdmin } from "@/lib/premium-themes";
import { requireModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";
import { getStorefrontKind } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

export default async function AdminPremiumThemesPage() {
  await requireAdminModuleView("premiumThemes");
  await requireModule("premiumThemes");

  const storeId = await getStoreId();
  const vertical = getStorefrontKind();
  const settings = await getStoreThemeSettingsForAdmin(storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Temas premium"
          description="Personalizá la apariencia del storefront sin redeploy."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminThemeSettingsForm initialSettings={settings} vertical={vertical} />
      </AdminDashboardReveal>
    </div>
  );
}
