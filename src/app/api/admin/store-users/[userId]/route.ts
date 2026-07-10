import { NextRequest, NextResponse } from "next/server";
import { requireStoreOwnerSession } from "@/lib/store-users/admin-auth";
import { removeStoreStaffMember } from "@/lib/store-users/invite";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const ownerResult = await requireStoreOwnerSession();
  if ("error" in ownerResult) return ownerResult.error;

  try {
    await assertModule("multiUser");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return response;
    throw moduleError;
  }

  const { userId } = await context.params;

  if (ownerResult.session.user.id === userId) {
    return NextResponse.json(
      { error: "No podés quitarte a vos mismo." },
      { status: 400 },
    );
  }

  try {
    const storeId = await getStoreId();
    await removeStoreStaffMember(storeId, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo quitar al usuario.",
      },
      { status: 400 },
    );
  }
}
