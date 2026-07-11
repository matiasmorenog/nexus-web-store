import { NextRequest, NextResponse } from "next/server";
import { requireStoreOwnerSession } from "@/lib/store-users/admin-auth";
import {
  removeStoreStaffMember,
  updateStoreStaffRole,
} from "@/lib/store-users/invite";
import { isStoreStaffRole } from "@/lib/store-users/permissions";
import type { UpdateStoreStaffRoleInput } from "@/lib/store-users/types";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function requireMultiUserModule() {
  try {
    await assertModule("multiUser");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return { error: response };
    throw moduleError;
  }

  return {};
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const ownerResult = await requireStoreOwnerSession();
  if ("error" in ownerResult) return ownerResult.error;

  const moduleResult = await requireMultiUserModule();
  if ("error" in moduleResult) return moduleResult.error;

  const { userId } = await context.params;

  try {
    const body = (await request.json()) as UpdateStoreStaffRoleInput;

    if (!isStoreStaffRole(body.staffRole)) {
      return NextResponse.json(
        { error: "Seleccioná un rol válido." },
        { status: 400 },
      );
    }

    const storeId = await getStoreId();
    await updateStoreStaffRole(storeId, userId, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el rol.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const ownerResult = await requireStoreOwnerSession();
  if ("error" in ownerResult) return ownerResult.error;

  const moduleResult = await requireMultiUserModule();
  if ("error" in moduleResult) return moduleResult.error;

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
