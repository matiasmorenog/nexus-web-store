import { AdminCrmCustomersList } from "@/components/admin/admin-crm-customers-list";
import { AdminCrmSearchToolbar } from "@/components/admin/admin-crm-search-toolbar";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminSession } from "@/lib/admin-session";
import { listCrmCustomers } from "@/lib/crm/query";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
}>;

export default async function AdminCrmPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminSession();
  await requireModule("crm");

  const params = await searchParams;
  const customers = await listCrmCustomers(session.user.storeId, {
    q: params.q,
  });

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="CRM lite"
          description="Clientes derivados de pedidos reales. Agregá tags y notas internas para seguimiento comercial."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminCrmSearchToolbar query={params.q ?? ""} />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminCrmCustomersList customers={customers} />
      </AdminDashboardReveal>
    </div>
  );
}
