import { Prisma } from "@prisma/client";
import { normalizeCrmSegmentFilters } from "@/lib/crm/filters";
import type { CrmSegment, CrmSegmentInput } from "@/lib/crm/types";
import { db } from "@/lib/db";

const MAX_SEGMENT_NAME = 48;
const MAX_SEGMENTS_PER_STORE = 20;

function mapSegment(row: {
  id: string;
  name: string;
  filters: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): CrmSegment {
  return {
    id: row.id,
    name: row.name,
    filters: normalizeCrmSegmentFilters(row.filters),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCrmSegments(storeId: string): Promise<CrmSegment[]> {
  const rows = await db.storeCrmSegment.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
  });
  return rows.map(mapSegment);
}

export async function getCrmSegment(
  storeId: string,
  id: string,
): Promise<CrmSegment | null> {
  const row = await db.storeCrmSegment.findFirst({
    where: { storeId, id },
  });
  return row ? mapSegment(row) : null;
}

export async function createCrmSegment(
  storeId: string,
  input: CrmSegmentInput,
): Promise<CrmSegment> {
  const name = input.name.trim().slice(0, MAX_SEGMENT_NAME);
  if (!name) {
    throw new Error("El nombre del segmento es obligatorio.");
  }

  const count = await db.storeCrmSegment.count({ where: { storeId } });
  if (count >= MAX_SEGMENTS_PER_STORE) {
    throw new Error(`Máximo ${MAX_SEGMENTS_PER_STORE} segmentos por tienda.`);
  }

  const filters = normalizeCrmSegmentFilters(input.filters);

  try {
    const row = await db.storeCrmSegment.create({
      data: {
        storeId,
        name,
        filters: filters as Prisma.InputJsonValue,
      },
    });
    return mapSegment(row);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un segmento con ese nombre.");
    }
    throw error;
  }
}

export async function deleteCrmSegment(
  storeId: string,
  id: string,
): Promise<void> {
  const existing = await db.storeCrmSegment.findFirst({
    where: { storeId, id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Segmento no encontrado.");
  }
  await db.storeCrmSegment.delete({ where: { id } });
}
