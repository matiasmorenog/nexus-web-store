import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { auth } from "@/lib/auth";
import { getBrandPrefix } from "@/lib/brand";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) return <p>No autorizado</p>;

  const store = await db.store.findUniqueOrThrow({ where: { id: storeId } });

  return (
    <div>
      <AdminPageHeader
        title="Configuración"
        description="Nombre de marca, envíos y opciones de retiro en local."
      />
      <StoreSettingsForm
        store={{
          brandPrefix: getBrandPrefix(store.name),
          shippingFlatRate: Number(store.shippingFlatRate),
          allowPickup: store.allowPickup,
        }}
      />
    </div>
  );
}
