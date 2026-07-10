import { NextRequest } from "next/server";
import { authenticateStoreApiKey } from "@/lib/store-api/keys";
import { storeHasModule } from "@/lib/modules";

export async function authenticateStoreApiRequest(
  request: NextRequest,
): Promise<{ storeId: string; apiKeyId: string } | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const rawKey = header.slice("Bearer ".length).trim();
  if (!rawKey) {
    return null;
  }

  const auth = await authenticateStoreApiKey(rawKey);
  if (!auth) {
    return null;
  }

  if (!(await storeHasModule(auth.storeId, "api"))) {
    return null;
  }

  return auth;
}

export function unauthorizedApiResponse() {
  return Response.json({ error: "No autorizado" }, { status: 401 });
}
