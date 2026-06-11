"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

async function getAdminStoreId() {
  const session = await auth();
  if (!session?.user?.storeId) {
    throw new Error("No autorizado");
  }
  return session.user.storeId;
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

  await db.store.update({
    where: { id: storeId },
    data: {
      name: formData.get("name") as string,
      shippingFlatRate: parseFloat(formData.get("shippingFlatRate") as string) || 0,
      allowPickup: formData.get("allowPickup") === "on",
    },
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/");
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
      featured: formData.get("featured") === "on",
      variants: {
        create: {
          size: formData.get("size") as string,
          color: formData.get("color") as string,
          sku: `${slug}-${formData.get("size")}-${formData.get("color")}`.toUpperCase(),
          stock: parseInt(formData.get("stock") as string) || 0,
          price: parseFloat(formData.get("price") as string) || 0,
          imageUrl: (formData.get("imageUrl") as string) || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        },
      },
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return product;
}

export async function deleteProduct(productId: string) {
  const storeId = await getAdminStoreId();

  await db.product.deleteMany({
    where: { id: productId, storeId },
  });

  revalidatePath("/admin/productos");
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
      featured: formData.get("featured") === "on",
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/productos");
  revalidatePath(`/producto/${slug}`);
}

export async function createVariant(productId: string, formData: FormData) {
  const storeId = await getAdminStoreId();
  const product = await assertProductOwnership(productId, storeId);

  const size = formData.get("size") as string;
  const color = formData.get("color") as string;

  await db.productVariant.create({
    data: {
      productId,
      size,
      color,
      sku: `${product.slug}-${size}-${color}`.toUpperCase(),
      stock: parseInt(formData.get("stock") as string) || 0,
      price: parseFloat(formData.get("price") as string) || 0,
      imageUrl:
        (formData.get("imageUrl") as string) ||
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${productId}`);
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

  await db.productVariant.update({
    where: { id: variantId },
    data: {
      size,
      color,
      sku: `${variant.product.slug}-${size}-${color}`.toUpperCase(),
      stock: parseInt(formData.get("stock") as string) || 0,
      price: parseFloat(formData.get("price") as string) || 0,
      imageUrl: formData.get("imageUrl") as string,
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${variant.productId}`);
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

  await db.productVariant.delete({ where: { id: variantId } });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${variant.productId}`);
  revalidatePath("/productos");
  revalidatePath(`/producto/${variant.product.slug}`);
}
