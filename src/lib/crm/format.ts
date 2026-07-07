const MAX_TAG_LENGTH = 32;
const MAX_TAGS = 12;
const MAX_NOTES_LENGTH = 4000;

export function normalizeCustomerEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidCustomerEmail(email: string): boolean {
  const normalized = normalizeCustomerEmail(email);
  return normalized.includes("@") && normalized.length >= 5 && normalized.length <= 254;
}

export function parseCustomerTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    if (typeof raw === "string") {
      return parseCustomerTags(
        raw
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
      );
    }
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const item of raw) {
    if (typeof item !== "string") continue;
    const tag = item.trim().slice(0, MAX_TAG_LENGTH);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= MAX_TAGS) break;
  }

  return tags;
}

export function normalizeCustomerNotes(notes: unknown): string {
  if (typeof notes !== "string") return "";
  return notes.trim().slice(0, MAX_NOTES_LENGTH);
}

export function buildCrmCustomerHref(email: string): string {
  return `/admin/modulos/crm/${encodeURIComponent(normalizeCustomerEmail(email))}`;
}
