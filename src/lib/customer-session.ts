import { cache } from "react";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { buildCustomerLoginHref } from "@/lib/customer-auth-redirect";

type AuthenticatedCustomerUser = Session["user"] & {
  id: string;
  email: string;
};

export type CustomerSession = Omit<Session, "user"> & {
  user: AuthenticatedCustomerUser;
};

export const requireCustomerSession = cache(
  async (callbackPath?: string): Promise<CustomerSession> => {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "CUSTOMER") {
      redirect(buildCustomerLoginHref(callbackPath));
    }

    return {
      ...session,
      user: {
        ...session.user,
        id: session.user.id,
        email: session.user.email ?? "",
      },
    };
  },
);

export async function getOptionalCustomerSession() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return null;
  }
  return session;
}
