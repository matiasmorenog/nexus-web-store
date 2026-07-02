import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, role: true },
    });

    if (existing) {
      const message =
        existing.role === "CUSTOMER"
          ? "Ya existe una cuenta con ese email. Iniciá sesión."
          : "Ese email no está disponible para registro.";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role: "CUSTOMER",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear la cuenta" },
      { status: 500 },
    );
  }
}
