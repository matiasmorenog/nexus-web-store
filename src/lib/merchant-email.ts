import { db } from "@/lib/db";

export async function getMerchantEmail(storeId: string) {
  if (process.env.STORE_NOTIFICATION_EMAIL) {
    return process.env.STORE_NOTIFICATION_EMAIL;
  }

  const owner = await db.userStore.findFirst({
    where: { storeId },
    include: { user: true },
  });

  if (!owner?.user.email) {
    throw new Error("No hay email de comerciante configurado");
  }

  return owner.user.email;
}
