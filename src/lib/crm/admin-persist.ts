import {
  isValidCustomerEmail,
  normalizeCustomerEmail,
  normalizeCustomerNotes,
  parseCustomerTags,
} from "@/lib/crm/format";
import type { CrmCustomerProfileInput } from "@/lib/crm/types";
import { db } from "@/lib/db";

export async function saveCrmCustomerProfile(
  storeId: string,
  rawEmail: string,
  input: CrmCustomerProfileInput,
): Promise<void> {
  const email = normalizeCustomerEmail(rawEmail);
  if (!isValidCustomerEmail(email)) {
    throw new Error("Email de cliente inválido.");
  }

  const orderCount = await db.order.count({
    where: {
      storeId,
      customerEmail: { equals: email, mode: "insensitive" },
    },
  });

  if (orderCount === 0) {
    throw new Error("No hay pedidos para este cliente.");
  }

  const tags = parseCustomerTags(input.tags);
  const notes = normalizeCustomerNotes(input.notes);

  await db.storeCustomer.upsert({
    where: {
      storeId_email: { storeId, email },
    },
    create: {
      storeId,
      email,
      tags,
      notes,
    },
    update: {
      tags,
      notes,
    },
  });
}
