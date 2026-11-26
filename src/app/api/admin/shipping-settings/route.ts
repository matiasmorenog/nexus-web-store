import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveStoreShippingSettingsSection } from "@/lib/shipping-carriers/admin-persist";
import { getStoreShippingSettingsForAdmin } from "@/lib/shipping-carriers/query";
import type { StoreShippingSettingsSectionSave } from "@/lib/shipping-carriers/types";
import { moduleErrorResponse } from "@/lib/modules";
import { assertModule } from "@/lib/modules/access-server";
import { getStoreId } from "@/lib/store-context";

async function requireAdminStore() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  try {
    await assertModule("shippingCarriers");
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

  const settings = await getStoreShippingSettingsForAdmin(authResult.storeId);
  return NextResponse.json({ settings });
}

function isSectionSave(
  body: unknown,
): body is StoreShippingSettingsSectionSave {
  if (!body || typeof body !== "object") return false;
  const section = (body as { section?: unknown }).section;
  return (
    section === "global" ||
    section === "mercado_envios" ||
    section === "correo" ||
    section === "andreani" ||
    section === "pickup"
  );
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as unknown;
    if (!isSectionSave(body)) {
      return NextResponse.json(
        { error: "Payload inválido: falta section." },
        { status: 400 },
      );
    }
    await saveStoreShippingSettingsSection(authResult.storeId, body);
    const settings = await getStoreShippingSettingsForAdmin(authResult.storeId);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la configuración de envíos.",
      },
      { status: 400 },
    );
  }
}
