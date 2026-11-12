import type { ReactNode } from "react";
import { AdminConfigRouteHeader } from "@/components/admin/admin-config-route-header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminConfigRouteHeader />
      {children}
    </>
  );
}
