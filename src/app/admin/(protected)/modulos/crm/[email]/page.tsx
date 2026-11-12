import { notFound } from "next/navigation";
import { AdminCrmCustomerDetail } from "@/components/admin/admin-crm-customer-detail";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import {
  adminCanManageModule,
  requireAdminModuleView,
} from "@/lib/admin-session";
import {
  normalizeCustomerEmail,
  resolveCrmListReturnHref,
} from "@/lib/crm/format";
import { getCrmCustomerDetail } from "@/lib/crm/query";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  email: string;
}>;

type SearchParams = Promise<{
  from?: string;
}>;

export default async function AdminCrmCustomerPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const session = await requireAdminModuleView("crm");
  await requireModule("crm");

  const { email: rawEmail } = await params;
  const { from } = await searchParams;
  const email = normalizeCustomerEmail(decodeURIComponent(rawEmail));
  const customer = await getCrmCustomerDetail(session.user.storeId, email);

  if (!customer) {
    notFound();
  }

  const canManageCrm = adminCanManageModule(session, "crm");
  const listHref = resolveCrmListReturnHref(from);

  return (
    <AdminDashboardReveal index={0}>
      <AdminCrmCustomerDetail
        customer={customer}
        readOnly={!canManageCrm}
        listHref={listHref}
      />
    </AdminDashboardReveal>
  );
}
