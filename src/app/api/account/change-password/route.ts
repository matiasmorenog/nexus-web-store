import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { changeUserPassword } from "@/lib/password-reset";

const changeSchema = z.object({
  currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changeSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await changeUserPassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo cambiar la contraseña" },
      { status: 500 },
    );
  }
}
