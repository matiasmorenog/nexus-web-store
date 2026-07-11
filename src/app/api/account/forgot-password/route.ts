import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/emails/send-password-reset-email";
import { getMerchantEmailOptional } from "@/lib/merchant-email";
import { createPasswordResetToken } from "@/lib/password-reset";
import { getStoreSiteUrl } from "@/lib/seo/site-url";
import { getStore } from "@/lib/store-context";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

const GENERIC_OK = {
  ok: true,
  message:
    "Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.toLowerCase();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(GENERIC_OK);
    }

    const store = await getStore();
    const merchantEmail = await getMerchantEmailOptional(store.id);
    if (!merchantEmail) {
      return NextResponse.json(
        { error: "No se pudo enviar el email en este momento" },
        { status: 503 },
      );
    }

    const plainToken = await createPasswordResetToken(user.id);
    const resetUrl = `${getStoreSiteUrl()}/cuenta/restablecer-contrasena?token=${plainToken}`;

    await sendPasswordResetEmail(
      {
        storeName: store.name,
        recipientEmail: user.email,
        resetUrl,
      },
      merchantEmail,
    );

    return NextResponse.json(GENERIC_OK);
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud" },
      { status: 500 },
    );
  }
}
