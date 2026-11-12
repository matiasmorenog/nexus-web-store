import type { CrmListFilters, CrmListSort, CrmSegmentFilters } from "@/lib/crm/types";

const SORT_VALUES: CrmListSort[] = ["lastOrder", "totalSpent", "orderCount"];

export function parseCrmListSort(raw: string | null | undefined): CrmListSort | undefined {
  if (!raw) return undefined;
  return SORT_VALUES.includes(raw as CrmListSort)
    ? (raw as CrmListSort)
    : undefined;
}

export function parseInactiveDays(
  raw: string | null | undefined,
): number | undefined {
  if (!raw?.trim()) return undefined;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.min(value, 3650);
}

export function parseCrmListFilters(
  params: URLSearchParams | {
    q?: string;
    tag?: string;
    inactiveDays?: string;
    sort?: string;
  },
): CrmListFilters {
  const get = (key: "q" | "tag" | "inactiveDays" | "sort") => {
    if (params instanceof URLSearchParams) {
      return params.get(key) ?? undefined;
    }
    return params[key];
  };

  const q = get("q")?.trim() || undefined;
  const tag = get("tag")?.trim() || undefined;
  const inactiveDays = parseInactiveDays(get("inactiveDays"));
  const sort = parseCrmListSort(get("sort"));

  return {
    ...(q ? { q } : {}),
    ...(tag ? { tag } : {}),
    ...(inactiveDays ? { inactiveDays } : {}),
    ...(sort ? { sort } : {}),
  };
}

export function crmFiltersToSearchParams(
  filters: CrmListFilters | CrmSegmentFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.tag?.trim()) params.set("tag", filters.tag.trim());
  if (filters.inactiveDays && filters.inactiveDays > 0) {
    params.set("inactiveDays", String(filters.inactiveDays));
  }
  if (filters.sort && filters.sort !== "lastOrder") {
    params.set("sort", filters.sort);
  }
  return params;
}

export function buildCrmListHref(
  filters: CrmListFilters,
  segmentId?: string | null,
): string {
  const params = crmFiltersToSearchParams(filters);
  if (segmentId) params.set("segment", segmentId);
  const search = params.toString();
  return search ? `/admin/modulos/crm?${search}` : "/admin/modulos/crm";
}

export function normalizeCrmSegmentFilters(
  raw: unknown,
): CrmSegmentFilters {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const q = typeof record.q === "string" ? record.q.trim() : "";
  const tag = typeof record.tag === "string" ? record.tag.trim() : "";
  const inactiveDays =
    typeof record.inactiveDays === "number"
      ? record.inactiveDays
      : typeof record.inactiveDays === "string"
        ? parseInactiveDays(record.inactiveDays)
        : undefined;
  const sort = parseCrmListSort(
    typeof record.sort === "string" ? record.sort : undefined,
  );

  return {
    ...(q ? { q } : {}),
    ...(tag ? { tag } : {}),
    ...(inactiveDays && inactiveDays > 0 ? { inactiveDays } : {}),
    ...(sort ? { sort } : {}),
  };
}

export function crmFiltersAreActive(filters: CrmListFilters): boolean {
  return Boolean(
    filters.q ||
      filters.tag ||
      (filters.inactiveDays && filters.inactiveDays > 0) ||
      (filters.sort && filters.sort !== "lastOrder"),
  );
}
