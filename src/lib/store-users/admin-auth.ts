import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminMayAccessCurrentStore } from "@/lib/store-users/membership";
import { canManageStoreUsers } from "@/lib/store-users/permissions";

export async function requireStoreOwnerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const access = await adminMayAccessCurrentStore(
    session.user.id,
    session.user.role,
  );

  if (!access.allowed || !access.storeId) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  if (
    !canManageStoreUsers({
      role: session.user.role,
      staffRole: access.staffRole,
    })
  ) {
    return {
      error: NextResponse.json(
        { error: "Solo un administrador puede gestionar usuarios." },
        { status: 403 },
      ),
    };
  }

  return { session };
}
