import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseCrmListFilters } from "@/lib/crm/filters";
import { listCrmCustomers } from "@/lib/crm/query";
import {
  buildCustomersCsv,
  csvAttachmentFilename,
} from "@/lib/exports";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

const MAX_EXPORT_ROWS = 500;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await assertModule("crm");

    const storeId = await getStoreId();
    const filters = parseCrmListFilters(request.nextUrl.searchParams);
    const customers = await listCrmCustomers(storeId, {
      ...filters,
      limit: MAX_EXPORT_ROWS,
    });

    const csv = buildCustomersCsv(customers);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvAttachmentFilename("clientes")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const moduleResponse = moduleErrorResponse(error);
    if (moduleResponse) return moduleResponse;

    console.error("CRM customers export error:", error);
    return NextResponse.json(
      { error: "No se pudo exportar los clientes." },
      { status: 500 },
    );
  }
}
