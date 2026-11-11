import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/password-reset";
import {
  PASSWORD_MIN_LENGTH,
  passwordTooShortMessage,
} from "@/lib/password-policy";
import { storefrontPath } from "@/lib/storefront-paths";

const resetSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, passwordTooShortMessage("es")),
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
        result.user.role === "CUSTOMER"
          ? storefrontPath("signIn")
          : "/admin/login",
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo restablecer la contraseña" },
      { status: 500 },
    );
  }
}
