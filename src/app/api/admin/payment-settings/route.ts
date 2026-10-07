import { NextRequest, NextResponse } from "next/server";
import { ADMIN_LOCALE_COOKIE, parseAdminLocale } from "@/lib/admin-locale";
import { auth } from "@/lib/auth";
import {
  getStorePaymentSettingsForAdmin,
  saveStorePaymentSettings,
} from "@/lib/payments/server";
import type { StorePaymentSettingsSaveInput } from "@/lib/payments/types";
import { getStoreId } from "@/lib/store-context";

async function requireAdminStore() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const storeId = await getStoreId();
  return { storeId };
}

export async function GET() {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const settings = await getStorePaymentSettingsForAdmin(authResult.storeId);
  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as StorePaymentSettingsSaveInput;
    await saveStorePaymentSettings(
      authResult.storeId,
      body,
      parseAdminLocale(request.cookies.get(ADMIN_LOCALE_COOKIE)?.value),
    );
    const settings = await getStorePaymentSettingsForAdmin(authResult.storeId);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración de pagos.",
      },
      { status: 400 },
    );
  }
}
