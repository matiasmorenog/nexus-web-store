"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { resolveAdminStoreId } from "@/lib/admin-store";
import { revalidateCatalogIndexCache } from "@/lib/catalog-index-query";
import { saveStoreSettingsFromForm } from "@/lib/admin-store-settings";
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

async function getAdminStoreId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }

  if (session.user.storeId) {
    return session.user.storeId;
  }

  const { storeId } = await resolveAdminStoreId(session.user.id);
  if (!storeId) {
    throw new Error("No autorizado");
  }

  return storeId;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const storeId = await getAdminStoreId();

  await db.order.updateMany({
    where: { id: orderId, storeId },
    data: { status: status as "PENDING" | "PAID" | "SHIPPED" | "CANCELLED" },
  });

  revalidatePath("/admin/pedidos");
}

export async function updateStoreSettings(formData: FormData) {
  const storeId = await getAdminStoreId();
  await saveStoreSettingsFromForm(storeId, formData);
}

export async function createProduct(formData: FormData) {
  const storeId = await getAdminStoreId();
  const name = formData.get("name") as string;
  const slug = slugify(name);

  const product = await db.product.create({
    data: {
      storeId,
      name,
      slug,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      audience: (formData.get("audience") as string) || "unisex",
      featured: formData.get("featured") === "on",
      promo2x1: formData.get("promo2x1") === "on",
      variants: {
        create: {
          size: formData.get("size") as string,
          color: formData.get("color") as string,
          sku: `${slug}-${formData.get("size")}-${formData.get("color")}`.toUpperCase(),
          stock: parseInt(formData.get("stock") as string) || 0,
          price: parseFloat(formData.get("price") as string) || 0,
          imageUrl: normalizeProductImageUrl(formData.get("imageUrl")),
        },
      },
    },
  });

  revalidatePath("/admin/productos");
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  return product;
}

export async function deleteProduct(productId: string) {
  const storeId = await getAdminStoreId();

  const variants = await db.productVariant.findMany({
    where: { productId, product: { storeId } },
    select: { imageUrl: true },
  });

  const deleted = await db.product.deleteMany({
    where: { id: productId, storeId },
  });

  if (deleted.count === 0) return;

  await cleanupProductImages(variants.map((variant) => variant.imageUrl));

  revalidatePath("/admin/productos");
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
}

async function assertProductOwnership(productId: string, storeId: string) {
  const product = await db.product.findFirst({
    where: { id: productId, storeId },
  });
  if (!product) throw new Error("Producto no encontrado");
  return product;
}

export async function updateProduct(productId: string, formData: FormData) {
  const storeId = await getAdminStoreId();
  await assertProductOwnership(productId, storeId);

  const name = formData.get("name") as string;
  const slug = slugify(name);

  const slugConflict = await db.product.findFirst({
    where: { storeId, slug, NOT: { id: productId } },
  });
  if (slugConflict) {
    throw new Error("Ya existe otro producto con ese nombre");
  }

  await db.product.update({
    where: { id: productId },
    data: {
      name,
      slug,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      audience: (formData.get("audience") as string) || "unisex",
      featured: formData.get("featured") === "on",
      promo2x1: formData.get("promo2x1") === "on",
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  revalidatePath(`/producto/${slug}`);
}

export async function upsertProductColor(productId: string, formData: FormData) {
  const storeId = await getAdminStoreId();
  const product = await assertProductOwnership(productId, storeId);

  const color = (formData.get("color") as string)?.trim();
  if (!color) throw new Error("Ingresá el nombre del color");

  const originalColor = (formData.get("originalColor") as string)?.trim() || null;
  const imageUrl = parseProductImageUrl(formData.get("imageUrl"));
  if (!imageUrl) throw new Error("Subí una imagen para el color");

  const lookupColor = originalColor ?? color;

  const existingVariants = await db.productVariant.findMany({
    where: {
      productId,
      color: { equals: lookupColor, mode: "insensitive" },
    },
  });

  if (existingVariants.length > 0) {
    if (originalColor === null) {
      throw new Error("Ya existe un color con ese nombre");
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
        throw new Error("Ya existe un color con ese nombre");
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
      throw new Error("Ya existe un color con ese nombre");
    }

    const template = await db.productVariant.findFirst({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });

    await db.productVariant.create({
      data: {
        productId,
        color,
        size: "M",
        stock: 0,
        price: template?.price ?? 0,
        imageUrl,
        sku: `${product.slug}-M-${color}`.toUpperCase(),
      },
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  revalidatePath(`/producto/${product.slug}`);
}

export async function deleteProductColor(productId: string, color: string) {
  const storeId = await getAdminStoreId();
  const product = await assertProductOwnership(productId, storeId);

  const trimmedColor = color.trim();
  if (!trimmedColor) throw new Error("Color no válido");

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
    throw new Error("Color no encontrado");
  }

  if (variantsForColor.length > 1) {
    throw new Error(
      "No se puede eliminar el color mientras tenga variantes. Eliminá primero los talles en la sección Variantes.",
    );
  }

  const [variant] = variantsForColor;

  if (variant._count.orderItems > 0) {
    throw new Error("No se puede eliminar: el color tiene pedidos asociados");
  }

  const totalVariants = await db.productVariant.count({
    where: { productId },
  });
  if (totalVariants <= 1) {
    throw new Error("El producto debe tener al menos una variante");
  }

  const orphanedImageUrl = variant.imageUrl;

  await db.productVariant.delete({ where: { id: variant.id } });

  await cleanupProductImageIfOrphaned(orphanedImageUrl);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  revalidatePath(`/producto/${product.slug}`);
}

export async function createVariant(productId: string, formData: FormData) {
  const storeId = await getAdminStoreId();
  const product = await assertProductOwnership(productId, storeId);

  const size = formData.get("size") as string;
  const color = formData.get("color") as string;

  const duplicate = await db.productVariant.findFirst({
    where: {
      productId,
      size: { equals: size.trim(), mode: "insensitive" },
      color: { equals: color.trim(), mode: "insensitive" },
    },
  });
  if (duplicate) {
    throw new Error("Ya existe ese talle para este color. Editá la fila existente.");
  }

  const imageUrl = await findProductColorImage(productId, color);
  if (!imageUrl) {
    throw new Error("Ese color no tiene imagen. Agregalo en la sección Colores.");
  }

  await db.productVariant.create({
    data: {
      productId,
      size,
      color,
      sku: `${product.slug}-${size}-${color}`.toUpperCase(),
      stock: parseInt(formData.get("stock") as string) || 0,
      price: parseFloat(formData.get("price") as string) || 0,
      imageUrl,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}/edit`);
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  revalidatePath(`/producto/${product.slug}`);
}

export async function updateVariant(variantId: string, formData: FormData) {
  const storeId = await getAdminStoreId();

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
    include: { product: true },
  });
  if (!variant) throw new Error("Variante no encontrada");

  const size = formData.get("size") as string;
  const color = formData.get("color") as string;

  const duplicate = await db.productVariant.findFirst({
    where: {
      productId: variant.productId,
      size: { equals: size.trim(), mode: "insensitive" },
      color: { equals: color.trim(), mode: "insensitive" },
      NOT: { id: variantId },
    },
  });
  if (duplicate) {
    throw new Error("Ya existe ese talle para este color.");
  }

  const imageUrl = await findProductColorImage(variant.productId, color);
  if (!imageUrl) {
    throw new Error("Ese color no tiene imagen. Agregalo en la sección Colores.");
  }

  const previousImageUrl = variant.imageUrl;

  await db.productVariant.update({
    where: { id: variantId },
    data: {
      size,
      color,
      sku: `${variant.product.slug}-${size}-${color}`.toUpperCase(),
      stock: parseInt(formData.get("stock") as string) || 0,
      price: parseFloat(formData.get("price") as string) || 0,
      imageUrl,
    },
  });

  await cleanupProductImageIfOrphaned(previousImageUrl);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${variant.productId}/edit`);
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  revalidatePath(`/producto/${variant.product.slug}`);
}

export async function deleteVariant(variantId: string) {
  const storeId = await getAdminStoreId();

  const variant = await db.productVariant.findFirst({
    where: { id: variantId, product: { storeId } },
    include: {
      product: true,
      _count: { select: { orderItems: true } },
    },
  });
  if (!variant) throw new Error("Variante no encontrada");

  if (variant._count.orderItems > 0) {
    throw new Error("No se puede eliminar: la variante tiene pedidos asociados");
  }

  const variantCount = await db.productVariant.count({
    where: { productId: variant.productId },
  });
  if (variantCount <= 1) {
    throw new Error("El producto debe tener al menos una variante");
  }

  const orphanedImageUrl = variant.imageUrl;

  await db.productVariant.delete({ where: { id: variantId } });

  await cleanupProductImageIfOrphaned(orphanedImageUrl);

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${variant.productId}/edit`);
  revalidateCatalogIndexCache();
  revalidatePath("/productos");
  revalidatePath(`/producto/${variant.product.slug}`);
}
