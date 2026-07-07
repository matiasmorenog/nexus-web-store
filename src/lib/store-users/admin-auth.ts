import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireStoreOwnerSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  if (
    session.user.role !== "STORE_OWNER" &&
    session.user.role !== "PLATFORM_ADMIN"
  ) {
    return {
      error: NextResponse.json(
        { error: "Solo el owner puede gestionar usuarios." },
        { status: 403 },
      ),
    };
  }

  return { session };
}
