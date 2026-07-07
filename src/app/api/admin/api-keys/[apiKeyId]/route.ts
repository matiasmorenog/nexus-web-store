import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revokeStoreApiKey } from "@/lib/store-api/keys";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

type RouteContext = {
  params: Promise<{ apiKeyId: string }>;
};

async function requireAdminStore() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  try {
    await assertModule("api");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return { error: response };
    throw moduleError;
  }

  const storeId = await getStoreId();
  return { storeId };
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const { apiKeyId } = await context.params;

  try {
    await revokeStoreApiKey(authResult.storeId, apiKeyId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo revocar la clave.",
      },
      { status: 400 },
    );
  }
}
