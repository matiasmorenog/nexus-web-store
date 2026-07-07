import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getStoreWebhookSettingsForAdmin,
  saveStoreWebhookSettings,
} from "@/lib/store-api/webhooks";
import type { StoreWebhookSettingsData } from "@/lib/store-api/types";
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

  const settings = await getStoreWebhookSettingsForAdmin(authResult.storeId);
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as StoreWebhookSettingsData;
    await saveStoreWebhookSettings(authResult.storeId, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el webhook.",
      },
      { status: 400 },
    );
  }
}
