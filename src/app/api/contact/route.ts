import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { formatStoreName } from "@/lib/brand";
import { sendContactEmail } from "@/lib/emails/send-contact-email";
import { getMerchantEmail } from "@/lib/merchant-email";
import { getStore } from "@/lib/store-context";
import { getStorefrontConfig } from "@/lib/store-verticals";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const store = await getStore();
    const merchantEmail = await getMerchantEmail(store.id);
    const config = getStorefrontConfig();
    const provisional =
      config.id === "app3" || merchantEmail.trim().toLowerCase().endsWith(".example");

    if (provisional) {
      return NextResponse.json(
        {
          error:
            config.locale === "it-IT"
              ? "Il modulo di contatto non è ancora attivo."
              : "El formulario de contacto aún no está activo.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            config.locale === "it-IT" ? "Dati non validi" : "Datos inválidos",
        },
        { status: 400 },
      );
    }

    const result = await sendContactEmail(
      {
        storeName: formatStoreName(store.name),
        ...parsed.data,
      },
      merchantEmail,
    );

    return NextResponse.json({ ok: true, mode: result.mode });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json(
      { error: "No se pudo enviar la consulta" },
      { status: 500 },
    );
  }
}
