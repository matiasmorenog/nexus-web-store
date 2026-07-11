import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/password-reset";

const resetSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await resetPasswordWithToken(
      parsed.data.token,
      parsed.data.password,
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      redirectTo:
        result.user.role === "CUSTOMER" ? "/cuenta/ingresar" : "/admin/login",
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo restablecer la contraseña" },
      { status: 500 },
    );
  }
}
