import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveStoreSettingsFromForm } from "@/lib/admin-store-settings";

export async function POST(request: NextRequest) {
  const session = await auth();
  const storeId = session?.user?.storeId;

  if (!storeId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    await saveStoreSettingsFromForm(storeId, formData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Store settings save error:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración. Intentá de nuevo." },
      { status: 500 },
    );
  }
}
