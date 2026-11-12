import type { ReactNode } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminCategoriasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AdminPageHeader
        title="Categorías"
        description="Definí las categorías del catálogo de esta tienda. Los productos usan el slug como texto (sin FK)."
      />
      {children}
    </>
  );
}
