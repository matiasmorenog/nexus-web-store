import bcrypt from "bcryptjs";
import type { StoreStaffRole } from "@prisma/client";
import type {
  InviteStoreStaffInput,
  UpdateStoreStaffRoleInput,
} from "@/lib/store-users/types";
import { isStoreStaffRole } from "@/lib/store-users/permissions";
import { db } from "@/lib/db";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseStaffRole(staffRole: StoreStaffRole): StoreStaffRole {
  if (!isStoreStaffRole(staffRole)) {
    throw new Error("Seleccioná un rol válido.");
  }

  return staffRole;
}

export async function inviteStoreStaffMember(
  storeId: string,
  input: InviteStoreStaffInput,
): Promise<{ userId: string }> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password;
  const staffRole = parseStaffRole(input.staffRole);

  if (!email || !email.includes("@")) {
    throw new Error("Ingresá un email válido.");
  }

  if (!name) {
    throw new Error("Ingresá el nombre del usuario.");
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const existing = await db.user.findUnique({
    where: { email },
    include: {
      stores: {
        where: { storeId },
        take: 1,
      },
    },
  });

  if (existing) {
    if (existing.role === "PLATFORM_ADMIN" || existing.role === "STORE_OWNER") {
      throw new Error("Ese email ya pertenece a un administrador de la tienda.");
    }

    if (existing.stores.length > 0) {
      throw new Error("Ese usuario ya tiene acceso a esta tienda.");
    }

    if (existing.role === "CUSTOMER") {
      throw new Error(
        "Ese email ya está registrado como cliente. Usá otro email para el staff.",
      );
    }

    await db.userStore.create({
      data: {
        userId: existing.id,
        storeId,
        staffRole,
      },
    });

    return { userId: existing.id };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "STORE_STAFF",
      stores: {
        create: { storeId, staffRole },
      },
    },
  });

  return { userId: user.id };
}

export async function updateStoreStaffRole(
  storeId: string,
  userId: string,
  input: UpdateStoreStaffRoleInput,
): Promise<void> {
  const staffRole = parseStaffRole(input.staffRole);

  const membership = await db.userStore.findFirst({
    where: { storeId, userId },
    include: { user: { select: { role: true } } },
  });

  if (!membership) {
    throw new Error("Usuario no encontrado en esta tienda.");
  }

  if (membership.user.role !== "STORE_STAFF") {
    throw new Error("Solo podés cambiar el rol de usuarios staff.");
  }

  await db.userStore.update({
    where: { id: membership.id },
    data: { staffRole },
  });
}

export async function removeStoreStaffMember(
  storeId: string,
  userId: string,
): Promise<void> {
  const membership = await db.userStore.findFirst({
    where: { storeId, userId },
    include: { user: { select: { role: true } } },
  });

  if (!membership) {
    throw new Error("Usuario no encontrado en esta tienda.");
  }

  if (membership.user.role !== "STORE_STAFF") {
    throw new Error("Solo podés quitar usuarios con rol staff.");
  }

  await db.$transaction(async (tx) => {
    await tx.userStore.deleteMany({
      where: { storeId, userId },
    });

    const remainingStores = await tx.userStore.count({
      where: { userId },
    });

    if (remainingStores === 0) {
      await tx.user.delete({ where: { id: userId } });
    }
  });
}
