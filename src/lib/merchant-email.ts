import { db } from "@/lib/db";

async function findMerchantEmail(storeId: string) {
  const owner = await db.userStore.findFirst({
    where: { storeId },
    include: { user: { select: { email: true } } },
  });

  return owner?.user.email ?? null;
}

/** Email del dueño si existe; null si la tienda no tiene usuario vinculado. */
export async function getMerchantEmailOptional(storeId: string) {
  return findMerchantEmail(storeId);
}

/** Email del dueño (contacto, notificaciones). Lanza si no hay owner en DB. */
export async function getMerchantEmail(storeId: string) {
  const email = await findMerchantEmail(storeId);

  if (!email) {
    throw new Error("No hay email de comerciante configurado para esta tienda");
  }

  return email;
}
