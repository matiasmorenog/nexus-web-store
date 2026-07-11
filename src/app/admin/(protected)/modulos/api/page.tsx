import { AdminApiSettingsPanel } from "@/components/admin/admin-api-settings-panel";
import { AdminAfipSettingsPanel } from "@/components/admin/admin-afip-settings-panel";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminModuleView } from "@/lib/admin-session";

import { getStoreAfipSettingsForAdmin } from "@/lib/afip/settings";
import { requireModule } from "@/lib/modules";
import {
  getStoreWebhookSettingsForAdmin,
  listStoreApiKeys,
} from "@/lib/store-api";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminApiPage() {
  await requireAdminModuleView("api");
  await requireModule("api");

  const storeId = await getStoreId();
  const [apiKeys, webhookSettings, afipSettings] = await Promise.all([
    listStoreApiKeys(storeId),
    getStoreWebhookSettingsForAdmin(storeId),
    getStoreAfipSettingsForAdmin(storeId),
  ]);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="API y webhooks"
          description="Claves REST para integraciones y webhooks de eventos de la tienda."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminApiSettingsPanel
          apiKeys={apiKeys}
          webhookSettings={webhookSettings}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminAfipSettingsPanel settings={afipSettings} />
      </AdminDashboardReveal>
    </div>
  );
}
