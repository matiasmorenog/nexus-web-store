import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveCrmCustomerProfile } from "@/lib/crm/admin-persist";
import { getCrmCustomerDetail } from "@/lib/crm/query";
import type { CrmCustomerProfileInput } from "@/lib/crm/types";
import { normalizeCustomerEmail } from "@/lib/crm/format";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

type RouteContext = {
  params: Promise<{ email: string }>;
};

async function requireAdminStore() {
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

export async function GET(_request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const { email: rawEmail } = await context.params;
  const email = normalizeCustomerEmail(decodeURIComponent(rawEmail));
  const customer = await getCrmCustomerDetail(authResult.storeId, email);

  if (!customer) {
    return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ customer });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const { email: rawEmail } = await context.params;
  const email = normalizeCustomerEmail(decodeURIComponent(rawEmail));

  try {
    const body = (await request.json()) as CrmCustomerProfileInput;
    await saveCrmCustomerProfile(authResult.storeId, email, body);
    const customer = await getCrmCustomerDetail(authResult.storeId, email);
    return NextResponse.json({ ok: true, customer });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el perfil del cliente.",
      },
      { status: 400 },
    );
  }
}
