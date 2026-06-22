import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof auth>>> & {
  user: {
    id: string;
    storeId: string;
    storeSlug: string | null;
    role: string;
    email?: string | null;
    name?: string | null;
  };
};

/** Gate único para `/admin/(protected)/*`: sesión válida + usuario y tienda en DB. */
export const requireAdminSession = cache(async (): Promise<AdminSession> => {
  const session = await auth();

  if (!session?.user?.id || !session.user.storeId) {
    redirect("/admin/logout");
  }

  return session as AdminSession;
});
