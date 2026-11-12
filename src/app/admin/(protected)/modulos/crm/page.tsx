import { AdminCrmCustomersList } from "@/components/admin/admin-crm-customers-list";
import { AdminCrmKpis } from "@/components/admin/admin-crm-kpis";
import { AdminCrmSearchToolbar } from "@/components/admin/admin-crm-search-toolbar";
import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  adminCanManageModule,
  requireAdminModuleView,
} from "@/lib/admin-session";
import { buildCrmListHref, parseCrmListFilters } from "@/lib/crm/filters";
import {
  getCrmStoreStats,
  listCrmCustomers,
  listCrmTags,
} from "@/lib/crm/query";
import { getCrmSegment, listCrmSegments } from "@/lib/crm/segments";
import { requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  tag?: string;
  inactiveDays?: string;
  sort?: string;
  segment?: string;
}>;

export default async function AdminCrmPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await requireAdminModuleView("crm");
  await requireModule("crm");

  const params = await searchParams;
  const segmentId = params.segment?.trim() || null;
  const segment = segmentId
    ? await getCrmSegment(session.user.storeId, segmentId)
    : null;

  const filters = segment
    ? { ...segment.filters }
    : parseCrmListFilters({
        q: params.q,
        tag: params.tag,
        inactiveDays: params.inactiveDays,
        sort: params.sort,
      });

  const canManage = adminCanManageModule(session, "crm");

  const [customers, stats, tags, segments] = await Promise.all([
    listCrmCustomers(session.user.storeId, filters),
    getCrmStoreStats(session.user.storeId),
    listCrmTags(session.user.storeId),
    listCrmSegments(session.user.storeId),
  ]);

  const listHref = buildCrmListHref(filters, segment?.id ?? null);

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="CRM"
          description="Clientes reales de la tienda: LTV, recompra, tags, segmentos y seguimiento comercial."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminCrmKpis stats={stats} />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={2}>
        <AdminCrmSearchToolbar
          filters={filters}
          tags={tags}
          segments={segments}
          activeSegmentId={segment?.id ?? null}
          canManage={canManage}
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={3}>
        <AdminCrmCustomersList customers={customers} listHref={listHref} />
      </AdminDashboardReveal>
    </div>
  );
}
