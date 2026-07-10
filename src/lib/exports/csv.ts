/** Escapa una celda para CSV (RFC 4180). */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvRow(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export function toCsvContent(rows: string[]): string {
  return `\uFEFF${rows.join("\r\n")}\r\n`;
}

export function csvAttachmentFilename(prefix: string, extension = "csv"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.${extension}`;
}
