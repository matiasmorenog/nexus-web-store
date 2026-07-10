import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createStoreApiKey, listStoreApiKeys } from "@/lib/store-api/keys";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

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

export async function GET() {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const apiKeys = await listStoreApiKeys(authResult.storeId);
  return NextResponse.json({ apiKeys });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as { name?: string };
    const apiKey = await createStoreApiKey(
      authResult.storeId,
      body.name ?? "",
    );
    return NextResponse.json({ apiKey });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo crear la clave.",
      },
      { status: 400 },
    );
  }
}
