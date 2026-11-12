import { cache } from "react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  isValidCustomerEmail,
  normalizeCustomerEmail,
} from "@/lib/crm/format";
import type {
  CrmCustomerDetail,
  CrmCustomerListItem,
  CrmCustomerProfile,
  CrmListFilters,
  CrmListSort,
  CrmStoreStats,
} from "@/lib/crm/types";
import { getOrderStatusLabel } from "@/lib/order-status";

export type CrmCustomersListParams = CrmListFilters & {
  limit?: number;
};

function decimalToNumber(value: Prisma.Decimal | null | undefined): number {
  if (value == null) return 0;
  return Number(value.toString());
}

function emptyProfile(email: string): CrmCustomerProfile {
  return {
    email,
    tags: [],
    notes: "",
    updatedAt: null,
  };
}

async function fetchCustomerProfiles(
  storeId: string,
  emails: string[],
): Promise<Map<string, CrmCustomerProfile>> {
  if (emails.length === 0) {
    return new Map();
  }

  const profiles = await db.storeCustomer.findMany({
    where: {
      storeId,
      email: { in: emails },
    },
  });

  return new Map(
    profiles.map((profile) => [
      profile.email,
      {
        email: profile.email,
        tags: profile.tags,
        notes: profile.notes,
        updatedAt: profile.updatedAt.toISOString(),
      },
    ]),
  );
}

function buildOrderSearchWhere(
  storeId: string,
  q?: string,
): Prisma.OrderWhereInput {
  const trimmed = q?.trim();
  if (!trimmed) {
    return { storeId };
  }

  return {
    storeId,
    OR: [
      { customerEmail: { contains: trimmed, mode: "insensitive" } },
      { customerName: { contains: trimmed, mode: "insensitive" } },
      { customerPhone: { contains: trimmed, mode: "insensitive" } },
    ],
  };
}

function sortCustomers(
  customers: CrmCustomerListItem[],
  sort: CrmListSort = "lastOrder",
): CrmCustomerListItem[] {
  const next = [...customers];
  if (sort === "totalSpent") {
    next.sort((a, b) => b.totalSpent - a.totalSpent);
  } else if (sort === "orderCount") {
    next.sort((a, b) => b.orderCount - a.orderCount);
  } else {
    next.sort(
      (a, b) =>
        new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime(),
    );
  }
  return next;
}

export async function listCrmTags(storeId: string): Promise<string[]> {
  const rows = await db.storeCustomer.findMany({
    where: { storeId, tags: { isEmpty: false } },
    select: { tags: true },
  });

  const seen = new Set<string>();
  for (const row of rows) {
    for (const tag of row.tags) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      seen.add(trimmed);
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b, "es"));
}

export async function getCrmStoreStats(storeId: string): Promise<CrmStoreStats> {
  const groups = await db.order.groupBy({
    by: ["customerEmail"],
    where: { storeId },
    _count: { _all: true },
    _sum: { total: true },
    _max: { createdAt: true },
  });

  const customerCount = groups.length;
  if (customerCount === 0) {
    return {
      customerCount: 0,
      averageLtv: 0,
      repurchaseRate: 0,
      inactive30Count: 0,
    };
  }

  const totalSpentAll = groups.reduce(
    (sum, group) => sum + decimalToNumber(group._sum.total),
    0,
  );
  const repurchaseCount = groups.filter((group) => group._count._all >= 2).length;
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const inactive30Count = groups.filter((group) => {
    const last = group._max.createdAt?.getTime() ?? 0;
    return last < cutoff;
  }).length;

  return {
    customerCount,
    averageLtv: totalSpentAll / customerCount,
    repurchaseRate: Math.round((repurchaseCount / customerCount) * 100),
    inactive30Count,
  };
}

export async function listCrmCustomers(
  storeId: string,
  params: CrmCustomersListParams = {},
): Promise<CrmCustomerListItem[]> {
  const limit = Math.min(Math.max(params.limit ?? 100, 1), 500);
  const needsBroadFetch = Boolean(params.tag || params.inactiveDays || params.sort);

  const groups = await db.order.groupBy({
    by: ["customerEmail"],
    where: buildOrderSearchWhere(storeId, params.q),
    _count: { _all: true },
    _sum: { total: true },
    _max: {
      createdAt: true,
      customerName: true,
      customerPhone: true,
    },
    orderBy: {
      _max: {
        createdAt: "desc",
      },
    },
    take: needsBroadFetch ? 500 : limit,
  });

  const emails = groups.map((group) =>
    normalizeCustomerEmail(group.customerEmail),
  );
  const profileMap = await fetchCustomerProfiles(storeId, emails);

  let customers: CrmCustomerListItem[] = groups.map((group) => {
    const email = normalizeCustomerEmail(group.customerEmail);
    const profile = profileMap.get(email) ?? emptyProfile(email);

    return {
      email,
      name: group._max.customerName?.trim() || "Sin nombre",
      phone: group._max.customerPhone?.trim() || "—",
      orderCount: group._count._all,
      totalSpent: decimalToNumber(group._sum.total),
      lastOrderAt: group._max.createdAt?.toISOString() ?? new Date(0).toISOString(),
      tags: profile.tags,
    };
  });

  if (params.tag?.trim()) {
    const tagKey = params.tag.trim().toLowerCase();
    customers = customers.filter((customer) =>
      customer.tags.some((tag) => tag.toLowerCase() === tagKey),
    );
  }

  if (params.inactiveDays && params.inactiveDays > 0) {
    const cutoff = Date.now() - params.inactiveDays * 24 * 60 * 60 * 1000;
    customers = customers.filter(
      (customer) => new Date(customer.lastOrderAt).getTime() < cutoff,
    );
  }

  customers = sortCustomers(customers, params.sort ?? "lastOrder");
  return customers.slice(0, limit);
}

export const getCrmCustomerDetail = cache(
  async (storeId: string, rawEmail: string): Promise<CrmCustomerDetail | null> => {
    const email = normalizeCustomerEmail(rawEmail);
    if (!isValidCustomerEmail(email)) {
      return null;
    }

    const orders = await db.order.findMany({
      where: {
        storeId,
        customerEmail: { equals: email, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        customerName: true,
        customerPhone: true,
      },
    });

    if (orders.length === 0) {
      return null;
    }

    const profileMap = await fetchCustomerProfiles(storeId, [email]);
    const profile = profileMap.get(email) ?? emptyProfile(email);

    const totalSpent = orders.reduce(
      (sum, order) => sum + decimalToNumber(order.total),
      0,
    );

    const latest = orders[0];
    const oldest = orders[orders.length - 1];

    return {
      email,
      name: latest.customerName.trim() || "Sin nombre",
      phone: latest.customerPhone.trim() || "—",
      orderCount: orders.length,
      totalSpent,
      lastOrderAt: latest.createdAt.toISOString(),
      firstOrderAt: oldest.createdAt.toISOString(),
      profile,
      orders: orders.map((order) => ({
        id: order.id,
        status: getOrderStatusLabel(order.status),
        total: decimalToNumber(order.total),
        createdAt: order.createdAt.toISOString(),
      })),
    };
  },
);
