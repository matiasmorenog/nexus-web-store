import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteCrmSegment } from "@/lib/crm/segments";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireCrmAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  try {
    await assertModule("crm");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return { error: response };
    throw moduleError;
  }

  const storeId = await getStoreId();
  return { storeId };
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireCrmAdmin();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;

  try {
    await deleteCrmSegment(authResult.storeId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el segmento.",
      },
      { status: 400 },
    );
  }
}
