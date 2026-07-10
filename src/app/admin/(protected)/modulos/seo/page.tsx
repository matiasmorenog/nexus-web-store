import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSeoSettingsForm } from "@/components/admin/admin-seo-settings-form";
import { requireAdminSession } from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";
import { getStoreSeoSettingsForAdmin } from "@/lib/seo/query";
import { getStoreId } from "@/lib/store-context";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  await requireAdminSession();
  await requireModule("seo");

  const storeId = await getStoreId();
  const settings = await getStoreSeoSettingsForAdmin(storeId);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="SEO avanzado"
          description="Meta tags, sitemap dinámico, robots.txt y structured data para buscadores."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminSeoSettingsForm initialSettings={settings} />
      </AdminDashboardReveal>
    </div>
  );
}
