import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildCrmListHref, parseCrmListFilters } from "@/lib/crm/filters";
import {
  getCrmStoreStats,
  listCrmCustomers,
  listCrmTags,
} from "@/lib/crm/query";
import { getCrmSegment, listCrmSegments } from "@/lib/crm/segments";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await assertModule("crm");

    const storeId = await getStoreId();
    const params = request.nextUrl.searchParams;
    const segmentId = params.get("segment")?.trim() || null;
    const segment = segmentId
      ? await getCrmSegment(storeId, segmentId)
      : null;

    const filters = segment
      ? { ...segment.filters }
      : parseCrmListFilters(params);

    const [customers, stats, tags, segments] = await Promise.all([
      listCrmCustomers(storeId, filters),
      getCrmStoreStats(storeId),
      listCrmTags(storeId),
      listCrmSegments(storeId),
    ]);

    const activeSegmentId = segment?.id ?? null;
    const listHref = buildCrmListHref(filters, activeSegmentId);

    return NextResponse.json({
      filters,
      activeSegmentId,
      listHref,
      customers,
      stats,
      tags,
      segments,
    });
  } catch (error) {
    const moduleResponse = moduleErrorResponse(error);
    if (moduleResponse) return moduleResponse;

    console.error("CRM list error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el CRM." },
      { status: 500 },
    );
  }
}
