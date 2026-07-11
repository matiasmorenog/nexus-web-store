import { AdminDashboardReveal } from "@/components/admin/admin-dashboard-reveal";
import { AdminStoreUsersPanel } from "@/components/admin/admin-store-users-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminPermission } from "@/lib/admin-session";
import { requireModule } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";
import { listStoreStaffMembers } from "@/lib/store-users";

export const dynamic = "force-dynamic";

export default async function AdminMultiUserPage() {
  const session = await requireAdminPermission("staff:manage");
  await requireModule("multiUser");

  const storeId = await getStoreId();
  const members = await listStoreStaffMembers(storeId);
  const canManage =
    session.user.role === "STORE_OWNER" ||
    session.user.role === "PLATFORM_ADMIN";

  return (
    <div className="space-y-8">
      <AdminDashboardReveal index={0}>
        <AdminPageHeader
          title="Multi-usuario"
          description="Invitá usuarios staff con roles de vendedor, depósito o solo lectura."
        />
      </AdminDashboardReveal>

      <AdminDashboardReveal index={1}>
        <AdminStoreUsersPanel members={members} canManage={canManage} />
      </AdminDashboardReveal>
    </div>
  );
}
