import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/emails/send-contact-email";
import { getMerchantEmail } from "@/lib/merchant-email";
import { getStore } from "@/lib/store-context";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const store = await getStore();
    const merchantEmail = await getMerchantEmail(store.id);

    const result = await sendContactEmail(
      {
        storeName: store.name,
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
