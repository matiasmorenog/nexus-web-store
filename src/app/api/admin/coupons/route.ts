import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  normalizeCouponCode,
  parseOptionalDate,
  parseOptionalDecimal,
  parseOptionalInt,
  serializeCoupon,
} from "@/lib/coupons/admin";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";

async function requireAdminStore() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  try {
    await assertModule("coupons");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return { error: response };
    throw moduleError;
  }

  const storeId = await getStoreId();
  return { storeId };
}

export async function GET() {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const coupons = await db.coupon.findMany({
    where: { storeId: authResult.storeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    coupons: coupons.map(serializeCoupon),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const formData = await request.formData();
  const code = normalizeCouponCode(String(formData.get("code") ?? ""));
  const type = String(formData.get("type") ?? "");
  const value = Number.parseFloat(String(formData.get("value") ?? ""));

  if (!code) {
    return NextResponse.json({ error: "Ingresá un código." }, { status: 400 });
  }

  if (type !== "PERCENTAGE" && type !== "FIXED_AMOUNT") {
    return NextResponse.json({ error: "Tipo de cupón inválido." }, { status: 400 });
  }

  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "El valor debe ser mayor a 0." }, { status: 400 });
  }

  if (type === "PERCENTAGE" && value > 100) {
    return NextResponse.json(
      { error: "El porcentaje no puede superar 100." },
      { status: 400 },
    );
  }

  const minOrderAmount = parseOptionalDecimal(formData.get("minOrderAmount")) ?? 0;
  const maxDiscount = parseOptionalDecimal(formData.get("maxDiscount"));
  const usageLimit = parseOptionalInt(formData.get("usageLimit"));
  const startsAt = parseOptionalDate(formData.get("startsAt"));
  const expiresAt = parseOptionalDate(formData.get("expiresAt"));

  if (minOrderAmount < 0) {
    return NextResponse.json({ error: "El mínimo de compra no puede ser negativo." }, { status: 400 });
  }

  if (maxDiscount != null && maxDiscount <= 0) {
    return NextResponse.json({ error: "El tope de descuento debe ser mayor a 0." }, { status: 400 });
  }

  if (usageLimit != null && usageLimit <= 0) {
    return NextResponse.json({ error: "El límite de usos debe ser mayor a 0." }, { status: 400 });
  }

  if (startsAt && expiresAt && startsAt > expiresAt) {
    return NextResponse.json(
      { error: "La fecha de inicio no puede ser posterior al vencimiento." },
      { status: 400 },
    );
  }

  const existing = await db.coupon.findUnique({
    where: {
      storeId_code: {
        storeId: authResult.storeId,
        code,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un cupón con ese código." },
      { status: 409 },
    );
  }

  const coupon = await db.coupon.create({
    data: {
      storeId: authResult.storeId,
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      startsAt,
      expiresAt,
      active: formData.get("active") !== "off",
    },
  });

  return NextResponse.json({ coupon: serializeCoupon(coupon) }, { status: 201 });
}
