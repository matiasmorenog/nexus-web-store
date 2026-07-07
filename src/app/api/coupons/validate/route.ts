import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeCouponCode } from "@/lib/coupons/format";
import { validateCouponForCheckout } from "@/lib/coupons/validate";
import { assertModule, moduleErrorResponse, storeHasModule } from "@/lib/modules";
import { db } from "@/lib/db";
import { getStoreId } from "@/lib/store-context";

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(request: NextRequest) {
  try {
    const storeId = await getStoreId();

    if (!(await storeHasModule(storeId, "coupons"))) {
      return NextResponse.json(
        { error: "Los cupones no están disponibles en esta tienda." },
        { status: 403 },
      );
    }

    await assertModule("coupons");

    const body = await request.json();
    const parsed = validateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const code = normalizeCouponCode(parsed.data.code);
    const coupon = await db.coupon.findUnique({
      where: {
        storeId_code: {
          storeId,
          code,
        },
      },
    });

    const result = validateCouponForCheckout(
      coupon,
      parsed.data.code,
      parsed.data.subtotal,
    );

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, code: result.code, error: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      code: result.code,
      couponId: result.couponId,
      discount: result.discount,
      type: result.type,
      value: result.value,
    });
  } catch (error) {
    const moduleResponse = moduleErrorResponse(error);
    if (moduleResponse) return moduleResponse;

    console.error("Coupon validate error:", error);
    return NextResponse.json({ error: "Error al validar el cupón" }, { status: 500 });
  }
}
