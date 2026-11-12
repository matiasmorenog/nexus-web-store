import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { normalizeCrmSegmentFilters } from "@/lib/crm/filters";
import { createCrmSegment, listCrmSegments } from "@/lib/crm/segments";
import type { CrmSegmentInput } from "@/lib/crm/types";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

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

export async function GET() {
  const authResult = await requireCrmAdmin();
  if ("error" in authResult) return authResult.error;

  const segments = await listCrmSegments(authResult.storeId);
  return NextResponse.json({ segments });
}

export async function POST(request: NextRequest) {
  const authResult = await requireCrmAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as Partial<CrmSegmentInput>;
    const segment = await createCrmSegment(authResult.storeId, {
      name: typeof body.name === "string" ? body.name : "",
      filters: normalizeCrmSegmentFilters(body.filters),
    });
    return NextResponse.json({ ok: true, segment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el segmento.",
      },
      { status: 400 },
    );
  }
}
