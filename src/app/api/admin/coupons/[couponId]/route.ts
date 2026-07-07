import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  parseOptionalDate,
  parseOptionalDecimal,
  parseOptionalInt,
  serializeCoupon,
} from "@/lib/coupons/admin";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";

type RouteContext = {
  params: Promise<{ couponId: string }>;
};

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const { couponId } = await context.params;
  const formData = await request.formData();

  const existing = await db.coupon.findFirst({
    where: { id: couponId, storeId: authResult.storeId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
  }

  const activeField = formData.get("active");
  if (activeField === "toggle") {
    const coupon = await db.coupon.update({
      where: { id: couponId },
      data: { active: !existing.active },
    });
    return NextResponse.json({ coupon: serializeCoupon(coupon) });
  }

  const type = String(formData.get("type") ?? existing.type);
  const value = Number.parseFloat(String(formData.get("value") ?? existing.value));

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

  const minOrderAmount =
    parseOptionalDecimal(formData.get("minOrderAmount")) ??
    Number(existing.minOrderAmount);
  const maxDiscount = parseOptionalDecimal(formData.get("maxDiscount"));
  const usageLimit = parseOptionalInt(formData.get("usageLimit"));
  const startsAt = parseOptionalDate(formData.get("startsAt"));
  const expiresAt = parseOptionalDate(formData.get("expiresAt"));

  if (startsAt && expiresAt && startsAt > expiresAt) {
    return NextResponse.json(
      { error: "La fecha de inicio no puede ser posterior al vencimiento." },
      { status: 400 },
    );
  }

  const coupon = await db.coupon.update({
    where: { id: couponId },
    data: {
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

  return NextResponse.json({ coupon: serializeCoupon(coupon) });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminStore();
  if ("error" in authResult) return authResult.error;

  const { couponId } = await context.params;

  const deleted = await db.coupon.deleteMany({
    where: { id: couponId, storeId: authResult.storeId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
