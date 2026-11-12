import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { resolveAdminModuleHeader } from "@/lib/admin-module-headers";

/** Server header for a module segment — outside that segment's loading.tsx. */
export function AdminModuleRouteHeader({
  modulePath,
}: {
  modulePath: string;
}) {
  const copy = resolveAdminModuleHeader(modulePath);
  if (!copy) return null;
  return (
    <AdminPageHeader title={copy.title} description={copy.description} />
  );
}
