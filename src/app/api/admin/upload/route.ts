import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadProductImage } from "@/lib/images/blob-storage";
import {
  optimizeProductImage,
  PRODUCT_IMAGE,
} from "@/lib/images/product-image";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.storeId || !session.user.storeSlug) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    if (!PRODUCT_IMAGE.allowedMimeTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido (JPG, PNG, WebP o GIF)" },
        { status: 400 },
      );
    }

    if (file.size > PRODUCT_IMAGE.maxInputBytes) {
      return NextResponse.json(
        { error: "Archivo demasiado grande (máx. 8 MB)" },
        { status: 400 },
      );
    }

    const inputBytes = file.size;
    const optimized = await optimizeProductImage(
      Buffer.from(await file.arrayBuffer()),
    );

    const url = await uploadProductImage({
      storeSlug: session.user.storeSlug,
      data: optimized,
    });

    return NextResponse.json({
      url,
      bytes: optimized.byteLength,
      savedPercent: Math.round((1 - optimized.byteLength / inputBytes) * 100),
    });
  } catch (error) {
    console.error("Upload error:", error);
    const raw =
      error instanceof Error ? error.message : "No se pudo subir la imagen";

    if (raw.includes("private store")) {
      return NextResponse.json(
        {
          error:
            "El Blob store está en modo Private. Las fotos de producto requieren un store Public (creá uno nuevo en Vercel → Storage → Blob → Public, región gru1). No se puede cambiar después de crearlo.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: raw }, { status: 500 });
  }
}
