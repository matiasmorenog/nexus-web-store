import type { InvoiceStatus } from "@prisma/client";

const LABELS: Record<InvoiceStatus, string> = {
  NONE: "Sin facturar",
  PENDING: "Pendiente AFIP",
  ISSUED: "Facturado",
  FAILED: "Error AFIP",
};

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return LABELS[status];
}
