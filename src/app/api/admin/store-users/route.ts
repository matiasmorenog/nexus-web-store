import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { inviteStoreStaffMember } from "@/lib/store-users/invite";
import { listStoreStaffMembers } from "@/lib/store-users/query";
import type { InviteStoreStaffInput } from "@/lib/store-users/types";
import { requireStoreOwnerSession } from "@/lib/store-users/admin-auth";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

async function requireModuleAccess() {
  try {
    await assertModule("multiUser");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return { error: response };
    throw moduleError;
  }

  return {};
}

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const moduleResult = await requireModuleAccess();
  if ("error" in moduleResult) return moduleResult;

  return { session };
}

export async function GET() {
  const authResult = await requireAdminSession();
  if ("error" in authResult) return authResult.error;

  const storeId = await getStoreId();
  const members = await listStoreStaffMembers(storeId);
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const ownerResult = await requireStoreOwnerSession();
  if ("error" in ownerResult) return ownerResult.error;

  const moduleResult = await requireModuleAccess();
  if ("error" in moduleResult) return moduleResult.error;

  try {
    const body = (await request.json()) as InviteStoreStaffInput;
    const storeId = await getStoreId();
    const result = await inviteStoreStaffMember(storeId, body);
    return NextResponse.json({ ok: true, userId: result.userId });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo invitar al usuario.",
      },
      { status: 400 },
    );
  }
}
