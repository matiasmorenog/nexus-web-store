import type { ReactNode } from "react";
import { AdminModulosHeader } from "@/components/admin/admin-modulos-header";

export default function AdminModulosLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Header keeps its own mb-8 (same as before page-level titles).
  // Do not use space-y here — it stacked with page wrappers and felt uneven.
  return (
    <div>
      <AdminModulosHeader />
      {children}
    </div>
  );
}
