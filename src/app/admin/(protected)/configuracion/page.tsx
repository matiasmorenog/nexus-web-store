import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

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
        description="Nombre de la tienda, envíos y opciones de retiro en local."
      />
      <StoreSettingsForm
        store={{
          name: store.name,
          shippingFlatRate: Number(store.shippingFlatRate),
          allowPickup: store.allowPickup,
        }}
      />
    </div>
  );
}
