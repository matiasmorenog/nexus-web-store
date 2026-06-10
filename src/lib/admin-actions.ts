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

export async function updateProduct(productId: string, formData: FormData) {
  const storeId = await getAdminStoreId();

  await db.product.updateMany({
    where: { id: productId, storeId },
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      featured: formData.get("featured") === "on",
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}
