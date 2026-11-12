import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminMarketingSettingsForm } from "@/components/admin/admin-marketing-settings-form";
import { requireAdminModuleView } from "@/lib/admin-session";

import { getStoreMarketingSettingsForAdmin } from "@/lib/marketing/query";
import { requireModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  await requireAdminModuleView("marketing");
  await requireModule("marketing");

  const storeId = await getStoreId();
  const settings = await getStoreMarketingSettingsForAdmin(storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={1}>
        <AdminMarketingSettingsForm initialSettings={settings} />
      </AdminDashboardReveal>
    </div>
  );
}
