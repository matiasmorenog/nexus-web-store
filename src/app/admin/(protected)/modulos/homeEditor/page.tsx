import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminHomeEditor } from "@/components/admin/admin-home-editor";
import { requireAdminModuleView } from "@/lib/admin-session";
import {
  applyHomeEditorCapabilities,
  getHomeEditorCapabilities,
} from "@/lib/home-content/capabilities";
import { getStoreHomeContentForAdmin } from "@/lib/home-content/query";
import {
  getEnabledModulesForStore,
  resolvePlanTier,
} from "@/lib/modules";
import { requireModule } from "@/lib/modules/access-server";
import { formatStoreName, getStore, getStoreId } from "@/lib/store-context";
import { getStorefrontKind } from "@/lib/store-verticals";

export const dynamic = "force-dynamic";

export default async function AdminHomeEditorPage() {
  await requireAdminModuleView("homeEditor");
  await requireModule("homeEditor");

  const storeId = await getStoreId();
  const store = await getStore();
  const storeDisplayName = formatStoreName(store.name);
  const vertical = getStorefrontKind();
  const enabled = await getEnabledModulesForStore(storeId);
  const planTier = resolvePlanTier([...enabled]);
  const capabilities = getHomeEditorCapabilities(planTier.id);
  const rawPayload = await getStoreHomeContentForAdmin(storeId);
  const payload = applyHomeEditorCapabilities(
    rawPayload,
    capabilities,
    vertical,
    storeDisplayName,
  );

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={1}>
        <AdminHomeEditor
          initialPayload={payload}
          vertical={vertical}
          capabilities={capabilities}
        />
      </AdminDashboardReveal>
    </div>
  );
}
