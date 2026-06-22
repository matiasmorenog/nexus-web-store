import { db } from "@/lib/db";

/** Email del dueño de la tienda (contacto público, notificaciones, login admin). */
export async function getMerchantEmail(storeId: string) {
  const owner = await db.userStore.findFirst({
    where: { storeId },
    include: { user: true },
  });

  if (!owner?.user.email) {
    throw new Error("No hay email de comerciante configurado para esta tienda");
  }

  return owner.user.email;
}
