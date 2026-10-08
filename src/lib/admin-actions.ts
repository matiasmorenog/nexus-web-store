"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import type { AdminActionResult } from "@/lib/admin-action-result";
import { ADMIN_LOCALE_COOKIE, parseAdminLocale } from "@/lib/admin-locale";
import {
  getAdminProductErrors,
  type AdminProductErrorKey,
} from "@/lib/admin-product-errors";
import { assertAdminPermission } from "@/lib/admin-session";
import {
  revalidateAdminDashboardCache,
  revalidateAdminProductDataCaches,
} from "@/lib/revalidate-admin-cache";
import { revalidateStorefrontProductSurfaces } from "@/lib/revalidate-storefront-products";
import { db } from "@/lib/db";
import {
  cleanupProductImages,
  cleanupProductImageIfOrphaned,
  cleanupReplacedProductImage,
} from "@/lib/images/cleanup-product-image";
import { normalizeProductImageUrl, parseProductImageUrl } from "@/lib/images/product-image";
import {
  findProductColorImage,
  normalizeVariantColor,
  syncProductColorImage,
} from "@/lib/variant-images";
import { slugify } from "@/lib/utils";
import type { AdminPermission } from "@/lib/store-users/permissions";
import { storeHasCategorySlug } from "@/lib/store-categories";
import {
  distinctSizes,
  resolveVariantSize,
  SIZELESS_SIZE_VALUE,
} from "@/lib/product-size";
import { getAdminVariantLabels, getVariantLabels } from "@/lib/variant-labels";
import { getStorefrontConfig } from "@/lib/store-verticals";

async function requireAdminStoreId(permission: AdminPermission) {
  const session = await assertAdminPermission(permission);
  return session.user.storeId;
}

async function productErrorCopy() {
  const cookieStore = await cookies();
  const locale = parseAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  return getAdminProductErrors(locale, getAdminVariantLabels(locale));
}

async function productError(key: AdminProductErrorKey): Promise<Error> {
  return new Error((await productErrorCopy())[key]);
}

async function readRequiredText(
  formData: FormData,
  field: string,
  errorKey: AdminProductErrorKey,
): Promise<string> {
  const value = String(formData.get(field) ?? "").trim();
  if (!value) throw await productError(errorKey);
  return value;
}

async function readPrice(formData: FormData): Promise<number> {
  const raw = String(formData.get("price") ?? "").trim().replace(",", ".");
  const value = Number(raw);
  if (!raw || !Number.isFinite(value) || value < 0) {
    throw await productError("priceInvalid");
  }
  return value;
}

async function readStock(formData: FormData): Promise<number> {
  const raw = String(formData.get("stock") ?? "").trim();
  const value = Number(raw);
  if (!raw || !Number.isInteger(value) || value < 0) {
    throw await productError("stockInvalid");
  }
  return value;
}

async function requireValidProductCategory(storeId: string, category: string) {
  const slug = category.trim();
  if (!slug) {
    throw await productError("categoryRequired");
  }
  const valid = await storeHasCategorySlug(storeId, slug);
  if (!valid) {
    throw await productError("categoryInvalid");
  }
  return slug;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const storeId = await requireAdminStoreId("orders:manage");

  await db.order.updateMany({
    where: { id: orderId, storeId },
    data: { status: status as "PENDING" | "PAID" | "SHIPPED" | "CANCELLED" },
  });

  revalidateAdminDashboardCache(storeId);
  revalidatePath("/admin/pedidos");
}

/** Same name is allowed: later products get `name-2`, `name-3`, … */
async function uniqueProductSlug(
  storeId: string,
  name: string,
  excludeProductId?: string,
): Promise<string> {
  const base = slugify(name) || "producto";
  const taken = await db.product.findMany({
    where: {
      storeId,
      slug: { startsWith: base },
      ...(excludeProductId ? { NOT: { id: excludeProductId } } : {}),
    },
    select: { slug: true },
  });
  const slugs = new Set(taken.map((row) => row.slug));
  if (!slugs.has(base)) return base;
  let suffix = 2;
  while (slugs.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

async function createProductImpl(formData: FormData) {
  const storeId = await requireAdminStoreId("products:manage");
  const name = await readRequiredText(formData, "name", "nameRequired");
  const description = await readRequiredText(
    formData,
    "description",
    "descriptionRequired",
  );
  const color = await readRequiredText(formData, "color", "primaryRequired");
  const price = await readPrice(formData);
  const stock = await readStock(formData);
  const category = await requireValidProductCategory(
    storeId,
    String(formData.get("category") ?? ""),
  );
  const slug = await uniqueProductSlug(storeId, name);
  const labels = getVariantLabels();
  const sizeToggle = getStorefrontConfig().features.productSizeToggle;
  const hasSize = sizeToggle
    ? formData.get("hasSize") === "on"
    : true;
  const size = resolveVariantSize(
    hasSize,
    formData.get("size") as string | null,
    labels.secondaryInitial ?? "M",
  );

  const product = await db.product.create({
    data: {
      storeId,
      name,
      slug,
      description,
      category,
      audience: (formData.get("audience") as string) || "unisex",
      featured: formData.get("featured") === "on",
      promo2x1: formData.get("promo2x1") === "on",
      hasSize,
      variants: {
        create: {
          size,
          color,
          sku: `${slug}-${size}-${color}`.toUpperCase(),
          stock,
          price,
          imageUrl: normalizeProductImageUrl(formData.get("imageUrl")),
        },
      },
    },
  });

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidateStorefrontProductSurfaces(product.slug);
  return product;
}

export async function deleteProduct(productId: string) {
  const storeId = await requireAdminStoreId("products:manage");

  const existing = await db.product.findFirst({
    where: { id: productId, storeId },
    select: { slug: true },
  });
  if (!existing) return;

  const variants = await db.productVariant.findMany({
    where: { productId, product: { storeId } },
    select: { imageUrl: true },
  });

  const deleted = await db.product.deleteMany({
    where: { id: productId, storeId },
  });

  if (deleted.count === 0) return;

  await cleanupProductImages(variants.map((variant) => variant.imageUrl));

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidateStorefrontProductSurfaces(existing.slug);
}

async function assertProductOwnership(productId: string, storeId: string) {
  const product = await db.product.findFirst({
    where: { id: productId, storeId },
  });
  if (!product) throw await productError("productNotFound");
  return product;
}

async function updateProductImpl(productId: string, formData: FormData) {
  const storeId = await requireAdminStoreId("products:manage");
  const product = await assertProductOwnership(productId, storeId);

  const name = await readRequiredText(formData, "name", "nameRequired");
  const category = await requireValidProductCategory(
    storeId,
    String(formData.get("category") ?? ""),
  );
  const slug =
    name === product.name
      ? product.slug
      : await uniqueProductSlug(storeId, name, productId);

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      description: formData.get("description") as string,
      category,
      audience: (formData.get("audience") as string) || "unisex",
      featured: formData.get("featured") === "on",
      promo2x1: formData.get("promo2x1") === "on",
      active: formData.get("active") === "on",
    },
  });

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateStorefrontProductSurfaces(slug);
  if (slug !== product.slug) revalidateStorefrontProductSurfaces(product.slug);
}

async function updateProductHasSizeImpl(productId: string, hasSize: boolean) {
  const storeId = await requireAdminStoreId("products:manage");
  const product = await assertProductOwnership(productId, storeId);

  if (!getStorefrontConfig().features.productSizeToggle) {
    throw await productError("sizeToggleUnavailable");
  }

  if (!hasSize) {
    const variants = await db.productVariant.findMany({
      where: { productId },
      select: { id: true, size: true, color: true },
    });
    const sizes = distinctSizes(variants.map((v) => v.size));
    if (sizes.length > 1) {
      throw await productError("sizeToggleMultiple");
    }

    const keepSize = sizes[0] ?? SIZELESS_SIZE_VALUE;
    if (keepSize !== SIZELESS_SIZE_VALUE) {
      for (const variant of variants) {
        if (variant.size === SIZELESS_SIZE_VALUE) continue;
        await db.productVariant.update({
          where: { id: variant.id },
          data: {
            size: SIZELESS_SIZE_VALUE,
            sku: `${product.slug}-${SIZELESS_SIZE_VALUE}-${variant.color}`.toUpperCase(),
          },
        });
      }
    }
  }

  await db.product.update({
    where: { id: productId },
    data: { hasSize },
  });

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateStorefrontProductSurfaces(product.slug);
}

async function upsertProductColorImpl(productId: string, formData: FormData) {
  const storeId = await requireAdminStoreId("products:manage");
  const product = await assertProductOwnership(productId, storeId);

  const color = (formData.get("color") as string)?.trim();
  if (!color) throw await productError("primaryRequired");

  const originalColor = (formData.get("originalColor") as string)?.trim() || null;
  const imageUrl = parseProductImageUrl(formData.get("imageUrl"));
  if (!imageUrl) throw await productError("primaryImageRequired");

  const lookupColor = originalColor ?? color;

  const existingVariants = await db.productVariant.findMany({
    where: {
      productId,
      color: { equals: lookupColor, mode: "insensitive" },
    },
  });

  if (existingVariants.length > 0) {
    if (originalColor === null) {
      throw await productError("primaryDuplicate");
    }

    const oldImageUrl = existingVariants[0]?.imageUrl;
    const isRenaming =
      originalColor !== null &&
      normalizeVariantColor(originalColor) !== normalizeVariantColor(color);

    if (isRenaming) {
      const nameConflict = await db.productVariant.findFirst({
        where: {
          productId,
          color: { equals: color, mode: "insensitive" },
        },
      });
      if (nameConflict) {
        throw await productError("primaryDuplicate");
      }

      for (const variant of existingVariants) {
        await db.productVariant.update({
          where: { id: variant.id },
          data: {
            color,
            imageUrl,
            sku: `${product.slug}-${variant.size}-${color}`.toUpperCase(),
          },
        });
      }
    } else {
      await syncProductColorImage(productId, lookupColor, imageUrl);
    }

    await cleanupReplacedProductImage(oldImageUrl, imageUrl);
  } else {
    const nameConflict = await db.productVariant.findFirst({
      where: {
        productId,
        color: { equals: color, mode: "insensitive" },
      },
    });
    if (nameConflict) {
      throw await productError("primaryDuplicate");
    }

    const template = await db.productVariant.findFirst({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });

    const labels = getVariantLabels();
    const size = resolveVariantSize(
      product.hasSize,
      template?.size ?? labels.secondaryInitial,
      labels.secondaryInitial ?? "M",
    );

    await db.productVariant.create({
      data: {
        productId,
        color,
        size,
        stock: 0,
        price: template?.price ?? 0,
        imageUrl,
        sku: `${product.slug}-${size}-${color}`.toUpperCase(),
      },
    });
  }

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateStorefrontProductSurfaces(product.slug);
}

async function deleteProductColorImpl(productId: string, color: string) {
  const storeId = await requireAdminStoreId("products:manage");
  const product = await assertProductOwnership(productId, storeId);

  const trimmedColor = color.trim();
  if (!trimmedColor) throw await productError("primaryNotFound");

  const variantsForColor = await db.productVariant.findMany({
    where: {
      productId,
      color: { equals: trimmedColor, mode: "insensitive" },
    },
    include: {
      _count: { select: { orderItems: true } },
    },
  });

  if (variantsForColor.length === 0) {
    throw await productError("primaryNotFound");
  }

  if (variantsForColor.length > 1) {
    throw await productError("primaryHasVariants");
  }

  const [variant] = variantsForColor;

  if (variant._count.orderItems > 0) {
    throw await productError("primaryHasOrders");
  }

  const totalVariants = await db.productVariant.count({
    where: { productId },
  });
  if (totalVariants <= 1) {
    throw await productError("lastVariant");
  }

  const orphanedImageUrl = variant.imageUrl;

  await db.productVariant.delete({ where: { id: variant.id } });

  await cleanupProductImageIfOrphaned(orphanedImageUrl);

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateStorefrontProductSurfaces(product.slug);
}

async function createVariantImpl(productId: string, formData: FormData) {
  const storeId = await requireAdminStoreId("products:manage");
  const product = await assertProductOwnership(productId, storeId);

  const labels = getVariantLabels();
  const size = resolveVariantSize(
    product.hasSize,
    formData.get("size") as string | null,
    labels.secondaryInitial ?? "M",
  );
  const color = await readRequiredText(formData, "color", "primaryRequired");
  const price = await readPrice(formData);
  const stock = await readStock(formData);

  const duplicate = await db.productVariant.findFirst({
    where: {
      productId,
      size: { equals: size.trim(), mode: "insensitive" },
      color: { equals: color.trim(), mode: "insensitive" },
    },
  });
  if (duplicate) {
    throw await productError("variantDuplicate");
  }

  const imageUrl = await findProductColorImage(productId, color);
  if (!imageUrl) {
    throw await productError("variantMissingImage");
  }

  await db.productVariant.create({
    data: {
      productId,
      size,
      color,
      sku: `${product.slug}-${size}-${color}`.toUpperCase(),
      stock,
      price,
      imageUrl,
    },
  });

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateStorefrontProductSurfaces(product.slug);
}

async function updateVariantImpl(variantId: string, formData: FormData) {
  const storeId = await requireAdminStoreId("products:manage");

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
    include: { product: true },
  });
  if (!variant) throw await productError("variantNotFound");

  const labels = getVariantLabels();
  const size = resolveVariantSize(
    variant.product.hasSize,
    formData.get("size") as string | null,
    labels.secondaryInitial ?? "M",
  );
  const color = await readRequiredText(formData, "color", "primaryRequired");
  const price = await readPrice(formData);
  const stock = await readStock(formData);

  const duplicate = await db.productVariant.findFirst({
    where: {
      productId: variant.productId,
      size: { equals: size.trim(), mode: "insensitive" },
      color: { equals: color.trim(), mode: "insensitive" },
      NOT: { id: variantId },
    },
  });
  if (duplicate) {
    throw await productError("variantDuplicate");
  }

  const imageUrl = await findProductColorImage(variant.productId, color);
  if (!imageUrl) {
    throw await productError("variantMissingImage");
  }

  const previousImageUrl = variant.imageUrl;

  await db.productVariant.update({
    where: { id: variantId },
    data: {
      size,
      color,
      sku: `${variant.product.slug}-${size}-${color}`.toUpperCase(),
      stock,
      price,
      imageUrl,
    },
  });

  await cleanupProductImageIfOrphaned(previousImageUrl);

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${variant.productId}/edit`);
  revalidateStorefrontProductSurfaces(variant.product.slug);
}

async function deleteVariantImpl(variantId: string) {
  const storeId = await requireAdminStoreId("products:manage");

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
    include: {
      product: true,
      _count: { select: { orderItems: true } },
    },
  });
  if (!variant) throw await productError("variantNotFound");

  if (variant._count.orderItems > 0) {
    throw await productError("variantHasOrders");
  }

  const variantCount = await db.productVariant.count({
    where: { productId: variant.productId },
  });
  if (variantCount <= 1) {
    throw await productError("lastVariant");
  }

  const orphanedImageUrl = variant.imageUrl;

  await db.productVariant.delete({ where: { id: variantId } });

  await cleanupProductImageIfOrphaned(orphanedImageUrl);

  revalidateAdminProductDataCaches(storeId);
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${variant.productId}/edit`);
  revalidateStorefrontProductSurfaces(variant.product.slug);
}

async function asAdminActionResult(
  run: () => Promise<unknown>,
): Promise<AdminActionResult> {
  try {
    await run();
    return undefined;
  } catch (error) {
    unstable_rethrow(error);
    // Plain Error = our validation messages; Prisma/system details stay in the logs.
    if (error instanceof Error && error.constructor === Error) {
      return { error: error.message };
    }
    console.error("Admin product action failed:", error);
    return { error: (await productErrorCopy())[unexpectedErrorKey(error)] };
  }
}

function unexpectedErrorKey(error: unknown): AdminProductErrorKey {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "dbUnavailable";
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "duplicate";
    if (["P1001", "P1002", "P1017", "P2024"].includes(error.code)) {
      return "dbUnavailable";
    }
  }
  return "unexpected";
}

export async function createProduct(
  ...args: Parameters<typeof createProductImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => createProductImpl(...args));
}

export async function updateProduct(
  ...args: Parameters<typeof updateProductImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => updateProductImpl(...args));
}

export async function updateProductHasSize(
  ...args: Parameters<typeof updateProductHasSizeImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => updateProductHasSizeImpl(...args));
}

export async function upsertProductColor(
  ...args: Parameters<typeof upsertProductColorImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => upsertProductColorImpl(...args));
}

export async function deleteProductColor(
  ...args: Parameters<typeof deleteProductColorImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => deleteProductColorImpl(...args));
}

export async function createVariant(
  ...args: Parameters<typeof createVariantImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => createVariantImpl(...args));
}

export async function updateVariant(
  ...args: Parameters<typeof updateVariantImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => updateVariantImpl(...args));
}

export async function deleteVariant(
  ...args: Parameters<typeof deleteVariantImpl>
): Promise<AdminActionResult> {
  return asAdminActionResult(() => deleteVariantImpl(...args));
}
