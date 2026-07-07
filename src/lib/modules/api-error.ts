import { NextResponse } from "next/server";
import { isModuleRequiredError } from "@/lib/modules/access";

export function moduleErrorResponse(error: unknown) {
  if (isModuleRequiredError(error)) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        moduleId: error.moduleId,
        moduleName: error.moduleName,
        upgradeHref: error.upgradeHref,
      },
      { status: error.status },
    );
  }

  return null;
}
