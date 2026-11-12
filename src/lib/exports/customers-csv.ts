import type { CrmCustomerListItem } from "@/lib/crm/types";
import { toCsvContent, toCsvRow } from "@/lib/exports/csv";

export function buildCustomersCsv(customers: CrmCustomerListItem[]): string {
  const header = toCsvRow([
    "nombre",
    "email",
    "telefono",
    "pedidos",
    "total_comprado",
    "ultima_compra",
    "tags",
  ]);

  const rows = customers.map((customer) =>
    toCsvRow([
      customer.name,
      customer.email,
      customer.phone === "—" ? "" : customer.phone,
      customer.orderCount,
      customer.totalSpent.toFixed(2),
      customer.lastOrderAt,
      customer.tags.join("; "),
    ]),
  );

  return toCsvContent([header, ...rows]);
}
