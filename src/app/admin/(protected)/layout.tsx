import { cookies } from "next/headers";
import { AdminBodyScrollLock } from "@/components/admin/admin-body-scroll-lock";
import { AdminContentScrollArea } from "@/components/admin/admin-content-scroll-area";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  ADMIN_LOCALE_COOKIE,
  localizeAdminNavItem,
  parseAdminLocale,
} from "@/lib/admin-locale";
import {
  getAdminAccessContext,
  requireAdminSession,
} from "@/lib/admin-session";
import { getEnabledModuleIds } from "@/lib/modules";
import { getBrandPrefix, getStore } from "@/lib/store-context";
import { buildFilteredAdminNavItems } from "@/lib/store-users/admin-nav-access";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  const store = await getStore();
  const brandPrefix = getBrandPrefix(store.name);
  const enabledModuleIds = await getEnabledModuleIds(store.id);
  const accessContext = getAdminAccessContext(session);
  const navItems = buildFilteredAdminNavItems(accessContext, enabledModuleIds);
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  const localizedNav = navItems.map((item) => localizeAdminNavItem(item, locale));

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
          navItems={localizedNav}
          locale={locale}
        />
        <AdminContentScrollArea className="admin-content-bottom min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
          <main>{children}</main>
        </AdminContentScrollArea>
      </div>
    </>
  );
}
