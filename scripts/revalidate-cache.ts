import "dotenv/config";

const DEFAULT_URL = "http://localhost:3000";

async function main() {
  const secret =
    process.env.CACHE_REVALIDATE_SECRET ?? process.env.AUTH_SECRET;
  const baseUrl =
    process.env.CACHE_REVALIDATE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_URL;

  if (!secret) {
    console.warn(
      "cache:revalidate — sin CACHE_REVALIDATE_SECRET ni AUTH_SECRET; omitido.",
    );
    console.warn("  Reiniciá `npm run dev` si los datos del seed se ven viejos.");
    return;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/api/internal/revalidate-cache`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(
        `cache:revalidate — falló (${response.status}): ${body || response.statusText}`,
      );
      console.warn(
        "  ¿Está corriendo el servidor? (`npm run dev`). Si no, reinicialo tras el seed.",
      );
      return;
    }

    const data = (await response.json()) as {
      storeSlug?: string;
      productPaths?: number;
    };
    console.log(
      `cache:revalidate — OK (${data.storeSlug ?? "tienda"}, ${data.productPaths ?? 0} PDPs)`,
    );
  } catch (error) {
    const refused =
      error instanceof Error &&
      "cause" in error &&
      error.cause instanceof AggregateError &&
      error.cause.errors.some(
        (e) => e instanceof Error && "code" in e && e.code === "ECONNREFUSED",
      );

    if (refused) {
      console.warn(
        "cache:revalidate — omitido: no hay servidor en",
        baseUrl.replace(/\/$/, ""),
      );
      console.warn(
        "  Levantá `npm run dev` (u otro `next start`) y corré `npm run cache:revalidate`.",
      );
      console.warn(
        "  Los datos del seed ya están en la DB; el cache de Next se actualiza solo vía el servidor.",
      );
      return;
    }

    console.warn("cache:revalidate — no se pudo conectar:", error);
    console.warn(
      "  Reiniciá `npm run dev` y corré `npm run cache:revalidate` si los datos se ven viejos.",
    );
  }
}

main();
