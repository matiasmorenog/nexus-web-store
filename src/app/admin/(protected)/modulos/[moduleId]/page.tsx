import { notFound } from "next/navigation";
import { AdminModulePlaceholder } from "@/components/admin/admin-module-placeholder";
import { requireAdminModuleView } from "@/lib/admin-session";
import { isModuleId, requireModule } from "@/lib/modules";

export const dynamic = "force-dynamic";

type AdminModulePageProps = {
  params: Promise<{ moduleId: string }>;
};

export default async function AdminModulePage({ params }: AdminModulePageProps) {
  const { moduleId } = await params;

  if (!isModuleId(moduleId)) {
    notFound();
  }

  await requireAdminModuleView(moduleId);
  await requireModule(moduleId);

  return <AdminModulePlaceholder moduleId={moduleId} />;
}
