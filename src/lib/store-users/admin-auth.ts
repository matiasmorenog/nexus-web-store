import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStoreId } from "@/lib/store-context";
import { getStoreStaffRoleForUser } from "@/lib/store-users/membership";
import { canManageStoreUsers } from "@/lib/store-users/permissions";

export async function requireStoreOwnerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  let storeId: string;
  try {
    storeId = await getStoreId();
  } catch {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const staffRole =
    session.user.role === "STORE_STAFF"
      ? await getStoreStaffRoleForUser(storeId, session.user.id)
      : null;

  if (
    !canManageStoreUsers({
      role: session.user.role,
      staffRole,
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
