import { db } from "@/lib/db";
import { deleteProductImage, isManagedBlobUrl } from "@/lib/images/blob-storage";

export async function cleanupProductImageIfOrphaned(
  url: string | undefined,
): Promise<void> {
  if (!url || !isManagedBlobUrl(url)) return;

  const remaining = await db.productVariant.count({
    where: { imageUrl: url },
  });

  if (remaining === 0) {
    await deleteProductImage(url);
  }
}

export async function cleanupReplacedProductImage(
  oldUrl: string | undefined,
  newUrl: string,
): Promise<void> {
  if (!oldUrl || oldUrl === newUrl) return;
  await cleanupProductImageIfOrphaned(oldUrl);
}

export async function cleanupProductImages(urls: Iterable<string>): Promise<void> {
  const unique = new Set(urls);
  for (const url of unique) {
    await cleanupProductImageIfOrphaned(url);
  }
}
