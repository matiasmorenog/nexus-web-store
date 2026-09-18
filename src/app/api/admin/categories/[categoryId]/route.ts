import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  normalizeCategorySlug,
  parseAudiencesField,
  serializeStoreCategory,
  revalidateAfterStoreCategoryChange,
} from "@/lib/store-categories";
import { getStoreId } from "@/lib/store-context";
import { getStoreStaffRoleForUser } from "@/lib/store-users/membership";
import { hasAdminPermission } from "@/lib/store-users/permissions";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

async function requireCategoriesAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  let storeId: string;
  try {
    storeId = await getStoreId();
  } catch {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }

  const staffRole =
    session.user.role === "STORE_STAFF"
      ? await getStoreStaffRoleForUser(storeId, session.user.id)
      : null;

  if (
    !hasAdminPermission(
      { role: session.user.role, staffRole },
      "products:manage",
    )
  ) {
    return {
      error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }),
    };
  }

  return { storeId };
}

function mapCategoryRow(row: {
  id: string;
  storeId: string;
  slug: string;
  label: string;
  sortOrder: number;
  audiences: unknown;
  showInNav: boolean;
}) {
  return serializeStoreCategory({
    id: row.id,
    storeId: row.storeId,
    slug: row.slug,
    label: row.label,
    sortOrder: row.sortOrder,
    audiences: Array.isArray(row.audiences)
      ? row.audiences.filter((item): item is string => typeof item === "string")
      : null,
    showInNav: row.showInNav,
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireCategoriesAdmin();
  if ("error" in authResult) return authResult.error;

  const { categoryId } = await context.params;
  const formData = await request.formData();

  const existing = await db.storeCategory.findFirst({
    where: { id: categoryId, storeId: authResult.storeId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
  }

  const label = String(formData.get("label") ?? existing.label).trim();
  const slugRaw = String(formData.get("slug") ?? existing.slug).trim();
  const slug = normalizeCategorySlug(slugRaw || label);
  const sortOrder = Number.parseInt(
    String(formData.get("sortOrder") ?? existing.sortOrder),
    10,
  );
  const audiences =
    formData.has("audiences")
      ? parseAudiencesField(formData.get("audiences"))
      : Array.isArray(existing.audiences)
        ? existing.audiences.filter((item): item is string => typeof item === "string")
        : null;
  // Checkbox: presente = on; ausente en edit form = off (siempre enviamos el switch).
  const showInNav = formData.get("showInNav") === "on";

  if (!label) {
    return NextResponse.json({ error: "Ingresá un nombre." }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }

  if (slug !== existing.slug) {
    const conflict = await db.storeCategory.findUnique({
      where: {
        storeId_slug: {
          storeId: authResult.storeId,
          slug,
        },
      },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese slug." },
        { status: 409 },
      );
    }
  }

  const category = await db.$transaction(async (tx) => {
    if (slug !== existing.slug) {
      await tx.product.updateMany({
        where: {
          storeId: authResult.storeId,
          category: existing.slug,
        },
        data: { category: slug },
      });
    }

    return tx.storeCategory.update({
      where: { id: categoryId },
      data: {
        label,
        slug,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : existing.sortOrder,
        audiences: audiences === null ? Prisma.DbNull : audiences,
        showInNav,
      },
    });
  });

  revalidateAfterStoreCategoryChange(authResult.storeId);

  return NextResponse.json({
    category: mapCategoryRow({ ...category, audiences }),
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireCategoriesAdmin();
  if ("error" in authResult) return authResult.error;

  const { categoryId } = await context.params;

  const existing = await db.storeCategory.findFirst({
    where: { id: categoryId, storeId: authResult.storeId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 });
  }

  const productCount = await db.product.count({
    where: {
      storeId: authResult.storeId,
      category: existing.slug,
    },
  });

  if (productCount > 0) {
    return NextResponse.json(
      {
        error: `No se puede eliminar: hay ${productCount} producto${productCount === 1 ? "" : "s"} con esta categoría.`,
      },
      { status: 409 },
    );
  }

  await db.storeCategory.delete({ where: { id: categoryId } });
  revalidateAfterStoreCategoryChange(authResult.storeId);

  return NextResponse.json({ ok: true });
}
