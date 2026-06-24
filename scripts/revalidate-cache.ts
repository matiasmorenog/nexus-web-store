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
    console.warn("cache:revalidate — no se pudo conectar:", error);
    console.warn(
      "  Reiniciá `npm run dev` para limpiar cache en memoria tras db:seed.",
    );
  }
}

main();
