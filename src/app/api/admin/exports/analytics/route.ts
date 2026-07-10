import { NextRequest, NextResponse } from "next/server";
import {
  getActivityPeriodAnalytics,
  parseActivityPeriod,
} from "@/lib/admin-analytics";
import { buildAnalyticsReportCsv } from "@/lib/advanced-analytics/analytics-csv";
import { getAdvancedAnalyticsReport } from "@/lib/advanced-analytics";
import { auth } from "@/lib/auth";
import { csvAttachmentFilename } from "@/lib/exports";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await assertModule("analytics");

    const storeId = await getStoreId();
    const period = parseActivityPeriod(
      request.nextUrl.searchParams.get("period") ?? undefined,
    );

    const [report, periodAnalytics] = await Promise.all([
      getAdvancedAnalyticsReport(storeId, period),
      getActivityPeriodAnalytics(storeId, period),
    ]);

    const csv = buildAnalyticsReportCsv(report, periodAnalytics.topProducts);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${csvAttachmentFilename(`analytics-${period}`)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const moduleResponse = moduleErrorResponse(error);
    if (moduleResponse) return moduleResponse;

    console.error("Analytics export error:", error);
    return NextResponse.json(
      { error: "No se pudo exportar el reporte de analytics." },
      { status: 500 },
    );
  }
}
