import { NextRequest, NextResponse } from "next/server";
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

export async function GET() {
  const authResult = await requireCategoriesAdmin();
  if ("error" in authResult) return authResult.error;

  const categories = await db.storeCategory.findMany({
    where: { storeId: authResult.storeId },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });

  return NextResponse.json({
    categories: categories.map(mapCategoryRow),
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireCategoriesAdmin();
  if ("error" in authResult) return authResult.error;

  const formData = await request.formData();
  const label = String(formData.get("label") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = normalizeCategorySlug(slugRaw || label);
  const sortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const audiences = parseAudiencesField(formData.get("audiences"));
  const showInNav = formData.get("showInNav") === "on";

  if (!label) {
    return NextResponse.json({ error: "Ingresá un nombre." }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
  }

  const existing = await db.storeCategory.findUnique({
    where: {
      storeId_slug: {
        storeId: authResult.storeId,
        slug,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una categoría con ese slug." },
      { status: 409 },
    );
  }

  const category = await db.storeCategory.create({
    data: {
      storeId: authResult.storeId,
      slug,
      label,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      audiences: audiences ?? undefined,
      showInNav,
    },
  });

  revalidateAfterStoreCategoryChange(authResult.storeId);

  return NextResponse.json(
    { category: mapCategoryRow({ ...category, audiences }) },
    { status: 201 },
  );
}
