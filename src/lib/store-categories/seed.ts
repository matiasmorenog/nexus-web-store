import { Prisma, type PrismaClient } from "@prisma/client";
import type { ProductCategoryDef } from "@/lib/store-verticals/types";

/** Inserta categorías iniciales por tienda (idempotente por slug). */
export async function seedStoreCategories(
  prisma: PrismaClient,
  storeId: string,
  categories: readonly ProductCategoryDef[],
) {
  for (let index = 0; index < categories.length; index += 1) {
    const category = categories[index]!;
    await prisma.storeCategory.upsert({
      where: {
        storeId_slug: {
          storeId,
          slug: category.slug,
        },
      },
      create: {
        storeId,
        slug: category.slug,
        label: category.label,
        sortOrder: index,
        audiences: category.audiences ? [...category.audiences] : undefined,
        showInNav: true,
      },
      update: {
        label: category.label,
        sortOrder: index,
        audiences: category.audiences
          ? [...category.audiences]
          : Prisma.DbNull,
      },
    });
  }
}

/** Si la tienda no tiene filas, copia las del vertical actual (idempotente). */
export async function ensureStoreCategoriesSeeded(
  prisma: PrismaClient,
  storeId: string,
  categories: readonly ProductCategoryDef[],
) {
  const count = await prisma.storeCategory.count({ where: { storeId } });
  if (count > 0) return;
  await seedStoreCategories(prisma, storeId, categories);
}
