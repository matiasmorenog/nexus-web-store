import { put } from "@vercel/blob";

const CACHE_ONE_YEAR = 60 * 60 * 24 * 365;

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadProductImage(params: {
  storeSlug: string;
  data: Buffer;
}): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "Subida no disponible: configurá BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob)",
    );
  }

  const pathname = `${params.storeSlug}/products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;

  const blob = await put(pathname, params.data, {
    access: "public",
    token,
    contentType: "image/webp",
    cacheControlMaxAge: CACHE_ONE_YEAR,
    addRandomSuffix: false,
  });

  return blob.url;
}
