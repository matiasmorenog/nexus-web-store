import { notFound } from "next/navigation";
import { AdminCrmCustomerDetail } from "@/components/admin/admin-crm-customer-detail";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import {
  adminCanManageModule,
  requireAdminModuleView,
} from "@/lib/admin-session";
import { normalizeCustomerEmail } from "@/lib/crm/format";
import { getCrmCustomerDetail } from "@/lib/crm/query";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type PageParams = Promise<{
  email: string;
}>;

export default async function AdminCrmCustomerPage({
  params,
}: {
  params: PageParams;
}) {
  const session = await requireAdminModuleView("crm");
  await requireModule("crm");

  const { email: rawEmail } = await params;
  const email = normalizeCustomerEmail(decodeURIComponent(rawEmail));
  const customer = await getCrmCustomerDetail(session.user.storeId, email);

  if (!customer) {
    notFound();
  }

  const canManageCrm = adminCanManageModule(session, "crm");

  return (
    <AdminDashboardReveal index={0}>
      <AdminCrmCustomerDetail customer={customer} readOnly={!canManageCrm} />
    </AdminDashboardReveal>
  );
}
