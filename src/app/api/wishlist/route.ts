import { NextRequest, NextResponse } from "next/server";
import { getOptionalCustomerSession } from "@/lib/customer-session";
import { assertModule, moduleErrorResponse } from "@/lib/modules";
import { getStoreId } from "@/lib/store-context";
import { listCustomerWishlist } from "@/lib/wishlist/query";
import {
  addWishlistItem,
  removeWishlistItem,
  syncCustomerWishlist,
} from "@/lib/wishlist/server";

async function requireWishlistAccess() {
  try {
    await assertModule("wishlist");
  } catch (moduleError) {
    const response = moduleErrorResponse(moduleError);
    if (response) return { error: response };
    throw moduleError;
  }

  const session = await getOptionalCustomerSession();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Iniciá sesión para guardar favoritos." }, { status: 401 }),
    };
  }

  const storeId = await getStoreId();
  return { storeId, userId: session.user.id };
}

export async function GET() {
  const access = await requireWishlistAccess();
  if ("error" in access) return access.error;

  const items = await listCustomerWishlist(access.storeId, access.userId);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const access = await requireWishlistAccess();
  if ("error" in access) return access.error;

  try {
    const body = (await request.json()) as {
      productId?: string;
      productIds?: string[];
      action?: "add" | "remove" | "sync";
    };

    if (body.action === "sync" && Array.isArray(body.productIds)) {
      await syncCustomerWishlist(access.storeId, access.userId, body.productIds);
      const items = await listCustomerWishlist(access.storeId, access.userId);
      return NextResponse.json({ ok: true, items });
    }

    if (!body.productId) {
      return NextResponse.json({ error: "Falta productId." }, { status: 400 });
    }

    if (body.action === "remove") {
      await removeWishlistItem(access.storeId, access.userId, body.productId);
    } else {
      await addWishlistItem(access.storeId, access.userId, body.productId);
    }

    const items = await listCustomerWishlist(access.storeId, access.userId);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la wishlist.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const access = await requireWishlistAccess();
  if ("error" in access) return access.error;

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "Falta productId." }, { status: 400 });
  }

  await removeWishlistItem(access.storeId, access.userId, productId);
  const items = await listCustomerWishlist(access.storeId, access.userId);
  return NextResponse.json({ ok: true, items });
}
