export async function discardStagedProductImage(
  url: string | undefined,
): Promise<void> {
  if (!url) return;

  try {
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    // Best-effort: el servidor valida si puede borrar.
  }
}
