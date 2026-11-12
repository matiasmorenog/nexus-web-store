import type { ReactNode } from "react";
import { AdminCrmRouteHeader } from "@/components/admin/admin-crm-route-header";

export default function AdminCrmLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminCrmRouteHeader />
      {children}
    </>
  );
}
