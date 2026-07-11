import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const PASSWORD_MIN_LENGTH = 6;
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  return null;
}

export function hashResetToken(plainToken: string): string {
  return createHash("sha256").update(plainToken).digest("hex");
}

export function generateResetToken() {
  const plain = randomBytes(32).toString("hex");
  return { plain, hash: hashResetToken(plain) };
}

export async function createPasswordResetToken(userId: string) {
  const { plain, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await db.passwordResetToken.deleteMany({ where: { userId } });

  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hash,
      expiresAt,
    },
  });

  return plain;
}

export async function findValidResetToken(plainToken: string) {
  const tokenHash = hashResetToken(plainToken);
  const now = new Date();

  return db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: now },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function resetPasswordWithToken(plainToken: string, newPassword: string) {
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return { ok: false as const, error: passwordError };
  }

  const record = await findValidResetToken(plainToken);
  if (!record) {
    return {
      ok: false as const,
      error: "El enlace expiró o no es válido. Pedí uno nuevo.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true as const, user: record.user };
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return { ok: false as const, error: passwordError };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return { ok: false as const, error: "Usuario no encontrado" };
  }

  if (!user?.passwordHash) {
    return {
      ok: false as const,
      error: "Tu cuenta usa Google. Configurá una contraseña desde recuperación de acceso.",
    };
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false as const, error: "La contraseña actual es incorrecta" };
  }

  const sameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash);
  if (sameAsCurrent) {
    return {
      ok: false as const,
      error: "La nueva contraseña debe ser distinta a la actual",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.deleteMany({ where: { userId } }),
  ]);

  return { ok: true as const };
}
