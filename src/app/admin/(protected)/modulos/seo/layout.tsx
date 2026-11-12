import type { ReactNode } from "react";
import { AdminModuleRouteHeader } from "@/components/admin/admin-module-route-header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminModuleRouteHeader modulePath="/admin/modulos/seo" />
      {children}
    </>
  );
}
