import { cache } from "react";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { getStoreId } from "@/lib/store-context";

type AuthenticatedAdminUser = Session["user"] & {
  id: string;
  storeId: string;
};

export type AdminSession = Omit<Session, "user"> & {
  user: AuthenticatedAdminUser;
};

/** Gate único para `/admin/(protected)/*`: sesión válida + usuario y tienda en DB. */
export const requireAdminSession = cache(async (): Promise<AdminSession> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/logout");
  }

  let storeId: string;
  try {
    storeId = await getStoreId();
  } catch {
    redirect("/admin/logout");
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: session.user.id,
      storeId,
    },
  };
});
