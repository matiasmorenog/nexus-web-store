import { AdminBodyScrollLock } from "@/components/admin/admin-body-scroll-lock";
import { AdminContentScrollArea } from "@/components/admin/admin-content-scroll-area";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminSession } from "@/lib/admin-session";
import { getEnabledModuleIds } from "@/lib/modules";
import { getBrandPrefix, getStore } from "@/lib/store-context";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  const store = await getStore();
  const brandPrefix = getBrandPrefix(store.name);
  const enabledModuleIds = await getEnabledModuleIds(store.id);

  return (
    <>
      <AdminBodyScrollLock />
      <div
        data-admin-shell
        className="fixed inset-0 flex flex-col overflow-hidden bg-[#f6f6f7] lg:flex-row"
      >
        <AdminNav
          brandPrefix={brandPrefix}
          userName={session.user.name}
          userEmail={session.user.email}
          enabledModuleIds={enabledModuleIds}
        />
        <AdminContentScrollArea className="admin-content-bottom min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
          <main>{children}</main>
        </AdminContentScrollArea>
      </div>
    </>
  );
}
