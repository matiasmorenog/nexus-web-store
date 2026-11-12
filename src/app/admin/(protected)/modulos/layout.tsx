import type { ReactNode } from "react";
import { AdminModulosHeader } from "@/components/admin/admin-modulos-header";

export default function AdminModulosLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <AdminModulosHeader />
      {children}
    </div>
  );
}
